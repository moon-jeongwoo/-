// 백엔드 API 호출을 한 곳에 모아둔 파일 -- 각 페이지 스크립트는 fetch를 직접 안 쓰고 이 함수들만 부름.

async function apiGet(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`요청 실패: ${res.status}`);
  return res.json();
}

async function apiSend(path, method, body) {
  const res = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.detail || `요청 실패: ${res.status}`);
  }
  return res.json();
}

const api = {
  listTournaments: () => apiGet("/api/tournaments"),
  createTournament: (title, candidates) =>
    apiSend("/api/tournaments", "POST", { title, candidates }),
  deleteTournament: (id) => apiSend(`/api/tournaments/${id}`, "DELETE"),
  nextMatch: (id) => apiGet(`/api/tournaments/${id}/next-match`),
  vote: (id, matchId, winnerId) =>
    apiSend(`/api/tournaments/${id}/vote`, "POST", { match_id: matchId, winner_id: winnerId }),
  results: (id) => apiGet(`/api/tournaments/${id}/results`),
  candidateLibrary: () => apiGet("/api/candidate-library"),
  categories: () => apiGet("/api/categories"),
  quickStart: (category, size) => apiSend("/api/tournaments/quick-start", "POST", { category, size }),
};
