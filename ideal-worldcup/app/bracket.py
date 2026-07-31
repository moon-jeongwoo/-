"""
대진표를 짜는 순수 로직만 모아둔 곳 (DB나 FastAPI를 몰라도 되는 코드).
"두 명씩 짝짓기"가 핵심이라, 이 파일 하나만 봐도 토너먼트가 어떻게 진행되는지 알 수 있게 분리했습니다.
"""

import random

VALID_SIZES = (4, 8, 16, 32)


def make_first_round_pairs(candidate_ids: list[int]) -> list[tuple[int, int]]:
    """후보 id 목록을 랜덤으로 섞은 뒤, 순서대로 2명씩 짝지어 반환합니다.

    예: [1,2,3,4] -> 섞고 -> [3,1,4,2] -> [(3,1), (4,2)]
    """
    shuffled = candidate_ids[:]
    random.shuffle(shuffled)
    return list(zip(shuffled[0::2], shuffled[1::2]))


def make_next_round_pairs(winner_ids: list[int]) -> list[tuple[int, int]]:
    """직전 라운드 승자들을(match_order 순서 그대로) 2명씩 짝짓습니다.

    승자 순서를 섞지 않는 이유: 대진표는 원래 자리가 유지돼야 "누가 몇 강에서 이겼는지"가
    자연스럽고, 매 라운드 무작위로 다시 섞으면 대진표라는 개념 자체가 무의미해집니다.
    """
    return list(zip(winner_ids[0::2], winner_ids[1::2]))


def round_label(round_size: int) -> str:
    """matches.round 값(그 라운드에 들어오는 후보 수)을 화면에 보여줄 한국어 라벨로 바꿉니다.

    2명이 붙는 라운드는 관례상 "2강"이 아니라 "결승"이라고 부릅니다.
    """
    return "결승" if round_size == 2 else f"{round_size}강"
