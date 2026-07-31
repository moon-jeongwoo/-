// 결과 화면: 우승자 카드 + 후보별 승수를 막대로 정렬해서 보여줌 (movie-tracker StatsPanel과 같은 CSS 막대 방식).

const params = new URLSearchParams(window.location.search);
const tournamentId = params.get("id");
const resultBody = document.getElementById("result-body");

async function render() {
  const { tournament, candidates } = await api.results(tournamentId);
  const maxWins = Math.max(...candidates.map((c) => c.wins), 1);

  const championHtml = tournament.champion_name
    ? `
      <div class="champion-box">
        <img src="${tournament.champion_image_url || ""}" alt="" onerror="this.style.visibility='hidden'" />
        <div class="name">🏆 ${tournament.champion_name}</div>
      </div>
    `
    : `<p class="muted">아직 진행 중인 대회예요.</p>`;

  const barsHtml = candidates
    .map(
      (c) => `
      <div class="bar-row">
        <span class="label">${c.name}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${(c.wins / maxWins) * 100}%"></div></div>
        <span class="count">${c.wins}</span>
      </div>
    `
    )
    .join("");

  resultBody.innerHTML = `${championHtml}<div class="card">${barsHtml}</div>`;
}

render();
