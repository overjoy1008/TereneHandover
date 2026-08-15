import assert from "node:assert/strict"
import test from "node:test"
import { deleteById } from "../src/services/entities.service.js"

function scriptedClient(...results) {
    const calls = []
    return {
        calls,
        async query(sql, params) {
            calls.push({ sql, params })
            const next = results.shift()
            if (next instanceof Error) throw next
            return next ?? { rows: [] }
        },
        release() {
            calls.push({ sql: "RELEASE", params: undefined })
        },
    }
}

function scriptedQueryable(client) {
    return {
        async connect() {
            return client
        },
        async query(sql, params) {
            return client.query(sql, params)
        },
    }
}

function findHistoryInsert(calls) {
    return calls.find(
        (c) =>
            typeof c.sql === "string" &&
            c.sql.includes("INSERT INTO coupon_deletion_history_250618")
    )
}

test("definition delete history stores definitions_id and null instances_id", async () => {
    const definitionId = "CD-260815-1000-testdef01"
    const row = {
        coupon_definition_id: definitionId,
        name: "DEV Feature005 test",
        description: "test definition",
        discount_type: "fixed",
        discount_value: 1000,
    }
    const client = scriptedClient(
        { rows: [] }, // BEGIN
        { rows: [row] }, // SELECT
        { rows: [] }, // INSERT history
        { rows: [] }, // DELETE
        { rows: [] } // COMMIT
    )

    await deleteById(
        "coupon_definitions",
        "coupon_definition_id",
        definitionId,
        scriptedQueryable(client)
    )

    const insert = findHistoryInsert(client.calls)
    assert.ok(insert, "expected history INSERT")
    assert.equal(insert.params[0], "definition")
    assert.equal(insert.params[1], definitionId) // entity_id = deleted PK
    assert.equal(insert.params[2], definitionId) // definitions_id
    assert.equal(insert.params[3], null) // instances_id
    assert.equal(insert.params[4], null) // deleted_by
    assert.equal(insert.params[5], null) // source
    assert.equal(insert.params[6], JSON.stringify(row)) // snapshot preserved
    assert.match(insert.sql, /definitions_id/)
    assert.match(insert.sql, /instances_id/)
    assert.match(insert.sql, /entity_id/)
    assert.match(insert.sql, /snapshot/)
})

test("instance delete history stores related definitions_id and instances_id", async () => {
    const definitionId = "CD-260815-1000-testdef01"
    const instanceId = "CI-260815-1000-testinst1"
    const row = {
        coupon_instance_id: instanceId,
        coupon_definition_id: definitionId,
        status: "available",
        membership_number: "T0000001",
        sender_info: { name: "tester" },
    }
    const client = scriptedClient(
        { rows: [] }, // BEGIN
        { rows: [row] }, // SELECT
        { rows: [] }, // INSERT history
        { rows: [] }, // DELETE
        { rows: [] } // COMMIT
    )

    await deleteById(
        "coupon_instances",
        "coupon_instance_id",
        instanceId,
        scriptedQueryable(client)
    )

    const insert = findHistoryInsert(client.calls)
    assert.ok(insert, "expected history INSERT")
    assert.equal(insert.params[0], "instance")
    assert.equal(insert.params[1], instanceId) // entity_id = deleted PK
    assert.equal(insert.params[2], definitionId) // definitions_id from row
    assert.equal(insert.params[3], instanceId) // instances_id
    assert.equal(insert.params[4], null)
    assert.equal(insert.params[5], null)
    assert.equal(insert.params[6], JSON.stringify(row)) // full snapshot preserved
})

test("entity_id remains the deleted row primary key for both delete types", async () => {
    const definitionId = "CD-260815-1000-pkcheck01"
    const instanceId = "CI-260815-1000-pkcheck01"

    const defClient = scriptedClient(
        { rows: [] },
        {
            rows: [
                {
                    coupon_definition_id: definitionId,
                    name: "pk check",
                },
            ],
        },
        { rows: [] },
        { rows: [] },
        { rows: [] }
    )
    await deleteById(
        "coupon_definitions",
        "coupon_definition_id",
        definitionId,
        scriptedQueryable(defClient)
    )
    assert.equal(findHistoryInsert(defClient.calls).params[1], definitionId)

    const instClient = scriptedClient(
        { rows: [] },
        {
            rows: [
                {
                    coupon_instance_id: instanceId,
                    coupon_definition_id: definitionId,
                },
            ],
        },
        { rows: [] },
        { rows: [] },
        { rows: [] }
    )
    await deleteById(
        "coupon_instances",
        "coupon_instance_id",
        instanceId,
        scriptedQueryable(instClient)
    )
    assert.equal(findHistoryInsert(instClient.calls).params[1], instanceId)
})

test("missing coupon row skips history insert but still deletes", async () => {
    const client = scriptedClient(
        { rows: [] }, // BEGIN
        { rows: [] }, // SELECT empty
        { rows: [] }, // DELETE
        { rows: [] } // COMMIT
    )

    await deleteById(
        "coupon_definitions",
        "coupon_definition_id",
        "CD-missing",
        scriptedQueryable(client)
    )

    assert.equal(findHistoryInsert(client.calls), undefined)
    assert.ok(
        client.calls.some(
            (c) =>
                typeof c.sql === "string" &&
                c.sql.includes("DELETE FROM coupon_definitions_250618")
        )
    )
})
