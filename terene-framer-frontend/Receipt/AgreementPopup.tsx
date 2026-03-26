
import React, { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function AgreementPopup({
    onAgree,
    onCancel,
}: {
    onAgree: () => void
    onCancel: () => void
}) {
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCancel()
        }
        window.addEventListener("keydown", handleKey)
        return () => window.removeEventListener("keydown", handleKey)
    }, [onCancel])

    return (
        <AnimatePresence>
            <motion.div
                style={{
                    position: "fixed",
                    top: 20,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 9999,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onCancel}
            >
                <div
                    style={{
                        position: "relative",
                        maxWidth: "800px",
                        width: "90%",
                    }}
                >
                    {/* TOP BLUR */}
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 8,
                            height: "32px",
                            background:
                                "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0.9) 40%, rgba(255,255,255,0.7) 80%, rgba(255,255,255,0.0) 100%)",
                            zIndex: 30,
                            pointerEvents: "none",
                        }}
                    />

                    {/* BOTTOM BLUR */}
                    <div
                        style={{
                            position: "absolute",
                            bottom: -1,
                            left: 0,
                            right: 8,
                            height: "48px",
                            background:
                                "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.9) 40%, rgba(255,255,255,0.7) 80%, rgba(255,255,255,0.0) 100%)",
                            zIndex: 30,
                            pointerEvents: "none",
                        }}
                    />

                    <button
                        onClick={onCancel}
                        style={{
                            position: "absolute",
                            top: 16,
                            right: 24,
                            fontFamily: "Pretendard SemiBold",
                            fontSize: "16px",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            zIndex: 40,
                        }}
                    >
                        ✕
                    </button>

                    <style>
                        {`
                            .scrollbox {
                                scrollbar-width: thin;
                            }
                            .scrollbox::-webkit-scrollbar {
                                width: 8px;
                            }
                            .scrollbox::-webkit-scrollbar-thumb {
                                background: rgba(0,0,0,0.3);
                                border-radius: 4px;
                            }
                        `}
                    </style>

                    <motion.div
                        className="scrollbox"
                        style={{
                            backgroundColor: "white",
                            borderRadius: "0px",
                            padding: "48px",
                            maxHeight: `${window.innerHeight * 0.9}px`,
                            overflowY: "auto",
                            boxShadow: "0 0 20px rgba(0,0,0,0.2)",
                            position: "relative",
                        }}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            style={{
                                fontSize: "13px",
                                lineHeight: "1.6",
                                whiteSpace: "pre-wrap",
                            }}
                        >
                            <h2
                                style={{
                                    fontWeight: "bold",
                                    fontSize: "18px",
                                    textAlign: "center",
                                    marginBottom: "16px",
                                }}
                            >
                                TERENE 이용 규칙 동의서
                            </h2>
                            <p>
                                본 시설은 회원제 독채형 숙박시설로서 다음 숙박
                                고객의 원할한 시설 이용을 보장하고 쾌적한 환경
                                유지를 위해 비회원 숙박 시 이용 규칙 준수에 대한
                                사전 동의를 받고 있습니다. 아래 사항을 꼭
                                지켜주시길 부탁드립니다
                            </p>
                            <p
                                style={{
                                    fontWeight: "bold",
                                    textAlign: "center",
                                    margin: "16px 0",
                                }}
                            >
                                {
                                    "< 아래 내용을 위반하여 발생한 손해에 대하여 배상이 청구될 수 있고 이후 시설 예약 및 이용에 제한이 있을 수 있습니다 >"
                                }
                            </p>

                            <h3
                                style={{
                                    fontWeight: "bold",
                                    marginTop: "12px",
                                }}
                            >
                                기본 이용규칙
                            </h3>
                            <ul
                                style={{
                                    paddingLeft: "20px",
                                    marginTop: "8px",
                                }}
                            >
                                <li>
                                    예약자와 이용자는 동일해야하며 체크인 관련
                                    정보는 예약자 본인에게만 전달됩니다. (예약자
                                    없이 동행인이 먼저 단독으로 입실할 수
                                    없습니다)
                                </li>
                                <li>
                                    비대면 운영 : 체크인 이후 불편사항 또는 긴급
                                    상황 발생 시 자체적으로 대처해야하며 이로
                                    인한 불편을 이유로 환불을 요구할 수 없습니다
                                </li>
                                <li>
                                    체크인 이후 모든 문의는 카카오톡채널(ID :
                                    TERENE) 를 통해 가능하며 즉각적인 답변이
                                    어려울 수 있습니다
                                </li>
                                <li>
                                    시설 이용간 이용객의 부주의로 인해 발생한
                                    문제 또는 사고에 대한 모든 책임은 이용객에게
                                    있습니다
                                </li>
                                <li>
                                    모든 불법적인 행위는 금지되며, 이에 대한
                                    책임은 전부 고객에게 있습니다
                                </li>
                                <li>
                                    고객 부주의로 인한 분실, 도난에 대한 책임은
                                    전부 고객에게 있습니다.
                                </li>
                                <li>
                                    실내외 모든 공간은 금연공간입니다. 흡연으로
                                    인한 시설물의 악취, 훼손, 오염 발생 시
                                    청소비용이 청구됩니다
                                </li>
                                <li>
                                    반려동물 동반 투숙은 불가합니다. 동반 투숙
                                    시 청소비용(알러지 청소, 카펫 및 침구류
                                    세탁비용, 매트리스 청소 등) 및 영업손실금이
                                    청구됩니다
                                </li>
                            </ul>

                            <h3
                                style={{
                                    fontWeight: "bold",
                                    marginTop: "16px",
                                }}
                            >
                                퇴실시간 엄수 : 체크아웃 당일 오전 11시
                            </h3>
                            <ul
                                style={{
                                    paddingLeft: "20px",
                                    marginTop: "8px",
                                }}
                            >
                                <li>
                                    독채형리조트의 특성 상 늦은 퇴실은
                                    불가합니다. 다음 고객을 위해 필요한 최소
                                    준비시간이므로 적극 협조 부탁드립니다
                                </li>
                                <li>
                                    체크아웃 시간 이후에 유선연락이 되지 않는
                                    경우 담당 매니저가 임의로 실내 출입하여
                                    상황을 확인할 수 있습니다
                                </li>
                                <li>
                                    체크아웃 시간 이후에 유선연락이 되지 않는
                                    경우 담당 매니저가 임의로 실내 출입하여
                                    상황을 확인할 수 있습니다
                                </li>
                                <li>
                                    체크아웃 시간 이후에는 담당 매니저와
                                    청소직원이 출입하여 청소를 시작할 수
                                    있습니다
                                </li>
                                <li>
                                    체크아웃 시간 30분 이상 넘겨서 퇴실하는 경우
                                    50만원의 추가요금이 부과됩니다 (퇴실 시
                                    현장결제)
                                </li>
                            </ul>

                            <h3
                                style={{
                                    fontWeight: "bold",
                                    marginTop: "16px",
                                }}
                            >
                                시설보호의 의무
                            </h3>

                            <ul
                                style={{
                                    paddingLeft: "20px",
                                    marginTop: "8px",
                                }}
                            >
                                <li>
                                    외출 및 체크아웃 시에는 화재 등의 위험이
                                    있는 장비 또는 제품의 전원은 모두 끄고
                                    보안을 위해 출입문, 외부로 통하는 창문을
                                    모두 닫습니다
                                </li>
                                <li>
                                    주방 청소 : 사용하신 식기류는 식기세척기를
                                    이용하여 정리하고,
                                    일반/플라스틱/병/음식물쓰레기는 꼭 분리수거
                                    부탁드립니다
                                </li>
                                <li>
                                    BBQ시설 이용 시 장비는 정해진 장소에서만
                                    사용하고, 사용 후 그릴 및 야외테이블
                                    음식물과 쓰레기, 식기류는 깨끗히 정리
                                    부탁드립니다
                                </li>
                                <li>
                                    수영장, 노천탕 내 식음료 반입 및 취식,
                                    장비에 고장을 유발할 수 있는 소형
                                    장난감(물풍선 등) 및 입욕제 사용, 다이빙 등
                                    위험행위는 금지합니다
                                </li>
                                <li>
                                    일몰 시점에는 창문을 모두 닫아 벌레가 실내로
                                    유입되지 않도록 하여야 합니다
                                </li>
                                <li>
                                    사용 간 발생한 시설에 훼손, 파손, 고장,
                                    분실, 오염 등에 대한 책임은 이용객에게
                                    있으며 이에 대한 청소, 보수, 다음 고객의
                                    이용 피해 등에 대하여 추가 비용(손해배상)이
                                    청구될 수 있습니다
                                </li>
                            </ul>

                            <p
                                style={{
                                    textAlign: "center",
                                    fontWeight: "bold",
                                    marginTop: "20px",
                                }}
                            >
                                예약 및 이용자 본인은 위에 내용을 모두
                                확인하였으며 이에 동의합니다
                            </p>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                margin: "24px 0",
                                gap: "8px",
                            }}
                        >
                            <button
                                onClick={onAgree}
                                style={{
                                    fontFamily: "Pretendard SemiBold",
                                    fontSize: 12,
                                    color: "#000000",
                                    letterSpacing: "0em",
                                    lineHeight: "1.2em",
                                    padding: "10px 30px",
                                    backgroundColor: "#ebebeb",
                                    border: "none",
                                    cursor: "pointer",
                                }}
                            >
                                동의하고 결제하기
                            </button>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
