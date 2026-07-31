"""
가위바위보 패턴 학습 AI - 파이썬 초급자를 위한 학습용 프로젝트

API 키도, 추가 설치도 필요 없습니다. 파이썬만 있으면 바로 실행됩니다.
  python rps_ai.py

이 프로젝트에서 배우는 것
---------------------------
1) 파이썬 기초 문법: 변수, 함수, 딕셔너리(중첩 딕셔너리 포함), 반복문, 조건문, 리스트
2) "AI가 패턴을 학습한다"는 것의 가장 단순한 형태
   -> 사람은 가위바위보를 낼 때 완전히 무작위로 내지 못하고, 습관(패턴)이 있습니다.
      예: "직전에 바위를 냈으면, 다음엔 가위를 자주 낸다" 같은 버릇.
   -> 이 프로그램은 "직전에 낸 수 -> 그 다음에 낸 수"의 통계를 계속 기록해두고,
      그 통계를 바탕으로 "이번에 사용자가 뭘 낼지" 예측한 뒤, 그걸 이기는 수를 냅니다.
   -> 이게 바로 통계 기반 패턴 학습 AI의 핵심 아이디어입니다.
      (ChatGPT 같은 거대 언어모델도 원리를 극단적으로 단순화하면
       "이전 단어들을 보고 다음에 올 확률이 가장 높은 단어를 고른다"는 점에서 결이 비슷합니다.)
"""

import random  # AI가 처음엔 무작위로 내야 하니, 난수를 만들어주는 표준 라이브러리를 가져옵니다.


# 리스트(list): 순서가 있는 값들의 모음. 여기서는 가능한 손 모양 3가지를 담아둡니다.
MOVES = ["가위", "바위", "보"]

# 딕셔너리(dict): "키(key)"에 "값(value)"을 매칭해두는 자료구조.
# 여기서는 "이 수를 내면 -> 무엇을 이기는지"를 저장해둡니다. (가위는 보를 이긴다, 등)
BEATS = {
    "가위": "보",
    "바위": "가위",
    "보": "바위",
}


def get_counter_move(move: str) -> str:
    """
    주어진 move를 이기는 수를 반환하는 함수.
    BEATS 딕셔너리는 "내 수 -> 내가 이기는 상대 수"이므로,
    반대로 "이 move를 이기려면 무엇을 내야 하는가"를 구하려면
    BEATS 안에서 값(value)이 move인 키(key)를 찾아야 합니다.
    """
    # .items()는 딕셔너리의 (키, 값) 쌍을 하나씩 꺼내주는 반복 도구입니다.
    for winner, loser in BEATS.items():
        if loser == move:
            return winner
    raise ValueError(f"알 수 없는 손 모양: {move}")


def judge(user_move: str, ai_move: str) -> str:
    """두 수를 비교해서 승패를 판정하는 함수. "user", "ai", "draw" 중 하나를 반환합니다."""
    if user_move == ai_move:
        return "draw"
    # BEATS[user_move]는 "사용자가 낸 수가 이기는 대상"이므로,
    # 그게 ai_move와 같으면 사용자가 이긴 것입니다.
    if BEATS[user_move] == ai_move:
        return "user"
    return "ai"


def build_empty_transition_table() -> dict:
    """
    "직전에 낸 수 -> 그 다음에 낸 수" 통계를 저장할 중첩 딕셔너리를 0으로 초기화해서 만듭니다.
    예: transition_table["바위"]["가위"] = 3
        -> "직전에 바위를 낸 사람이, 그 다음 라운드에 가위를 낸 적이 3번 있다"는 뜻.

    중첩 딕셔너리(dict 안에 dict)라서 처음엔 헷갈릴 수 있는데,
    바깥쪽 딕셔너리의 "값"이 또 다른 딕셔너리인 구조일 뿐입니다.
    """
    table = {}
    for prev_move in MOVES:
        # 각 이전 수(prev_move)에 대해, 다음에 낼 수 있는 3가지 경우의 카운트를 0으로 시작합니다.
        table[prev_move] = {next_move: 0 for next_move in MOVES}
    return table


def predict_next_user_move(transition_table: dict, last_user_move: str) -> str | None:
    """
    직전에 사용자가 낸 수(last_user_move)를 바탕으로,
    통계상 사용자가 이번에 낼 가능성이 가장 높은 수를 예측합니다.
    데이터가 아직 없으면(전부 0이면) None을 반환해서 "예측 불가"를 알립니다.
    """
    counts = transition_table[last_user_move]  # {"가위": 2, "바위": 0, "보": 1} 같은 형태

    # 전부 0이면 아직 학습된 패턴이 없다는 뜻이므로 예측하지 않습니다.
    if all(count == 0 for count in counts.values()):
        return None

    # max(..., key=...)는 counts 딕셔너리에서 값(count)이 가장 큰 키를 찾아줍니다.
    return max(counts, key=lambda move: counts[move])


def decide_ai_move(transition_table: dict, last_user_move: str | None) -> str:
    """AI가 이번 라운드에 낼 수를 결정하는 함수."""
    # 첫 라운드(아직 직전 기록이 없음)에는 예측할 데이터가 없으므로 무작위로 냅니다.
    if last_user_move is None:
        return random.choice(MOVES)

    predicted_user_move = predict_next_user_move(transition_table, last_user_move)

    # 아직 패턴이 안 쌓였다면(None) 역시 무작위로 냅니다.
    if predicted_user_move is None:
        return random.choice(MOVES)

    # 예측이 맞다면, 그 수를 이기는 수를 내면 됩니다.
    return get_counter_move(predicted_user_move)


def read_user_move() -> str | None:
    """
    사용자 입력을 받아서 검증하는 함수.
    올바른 입력이면 그 값을, "종료"를 입력했으면 None을 반환합니다.
    """
    while True:  # 올바른 입력이 들어올 때까지 계속 되묻는 반복문
        raw = input("가위, 바위, 보 중 하나를 입력하세요 (종료: 그만): ").strip()

        if raw in ("종료", "exit", "quit"):
            return None

        if raw in MOVES:
            return raw

        print(f"'{raw}'는 알 수 없는 입력이에요. 가위/바위/보 중에서 입력해주세요.\n")


def main():
    """게임 전체를 진행하는 메인 함수."""
    transition_table = build_empty_transition_table()
    last_user_move = None  # 아직 아무도 안 냈으니 처음엔 None(값 없음)

    # 점수는 딕셔너리로 관리하면 나중에 출력할 때 편합니다.
    score = {"user": 0, "ai": 0, "draw": 0}

    print("=== 가위바위보 패턴 학습 AI ===")
    print("라운드가 쌓일수록 AI가 당신의 버릇을 학습해서 점점 더 잘 맞춥니다.\n")

    while True:
        user_move = read_user_move()

        if user_move is None:  # "종료"를 입력한 경우
            break

        ai_move = decide_ai_move(transition_table, last_user_move)
        result = judge(user_move, ai_move)
        score[result] += 1

        print(f"당신: {user_move}  /  AI: {ai_move}")
        if result == "draw":
            print("무승부입니다!\n")
        elif result == "user":
            print("당신의 승리!\n")
        else:
            print("AI의 승리!\n")

        # 이번 라운드의 "직전 수 -> 이번 수" 패턴을 통계에 반영합니다.
        # (last_user_move가 None인 첫 라운드는 기록할 "직전 수"가 없으므로 건너뜁니다.)
        if last_user_move is not None:
            transition_table[last_user_move][user_move] += 1

        # 다음 라운드를 위해 "직전 수"를 이번에 낸 수로 갱신합니다.
        last_user_move = user_move

    print("=== 최종 결과 ===")
    print(f"당신 승: {score['user']}회 / AI 승: {score['ai']}회 / 무승부: {score['draw']}회")


# 이 파일을 직접 실행했을 때만 게임이 시작되도록 합니다.
if __name__ == "__main__":
    main()
