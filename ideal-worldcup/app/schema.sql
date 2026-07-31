-- 대회(토너먼트) 하나. champion_id는 우승자가 정해지기 전까지 NULL.
CREATE TABLE IF NOT EXISTS tournaments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  created_at TEXT NOT NULL,
  champion_id INTEGER REFERENCES candidates(id)
);

-- 한 대회에 속한 후보(대결 항목). wins는 이 후보가 이긴 매치 수 -- 결과 화면 집계에 그대로 씀.
CREATE TABLE IF NOT EXISTS candidates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id INTEGER NOT NULL REFERENCES tournaments(id),
  name TEXT NOT NULL,
  image_url TEXT,
  wins INTEGER NOT NULL DEFAULT 0
);

-- 후보 두 명의 1:1 대결. winner_id가 NULL이면 아직 안 끝난 매치.
-- round는 "이 라운드에 몇 명이 들어왔는지"(8강=8, 4강=4, 결승=2), match_order는 그 라운드 안에서의 순서.
-- 라운드가 끝났을 때 "그 라운드 승자들만" 뽑아서 다음 라운드를 짜야 하므로 round로 라운드 경계를 명확히 구분해둠.
CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id INTEGER NOT NULL REFERENCES tournaments(id),
  round INTEGER NOT NULL,
  match_order INTEGER NOT NULL,
  candidate_a_id INTEGER NOT NULL REFERENCES candidates(id),
  candidate_b_id INTEGER NOT NULL REFERENCES candidates(id),
  winner_id INTEGER REFERENCES candidates(id)
);

-- 대회와 무관하게 "이름 -> 이미지 URL"을 기억해두는 곳. 대회를 만들 때마다 여기에 자동으로
-- 저장돼서, 같은 후보를 다음 대회에서 또 쓸 때 이미지 URL을 다시 안 붙여넣어도 되게 해줌.
CREATE TABLE IF NOT EXISTS candidate_library (
  name TEXT PRIMARY KEY,
  image_url TEXT
);
