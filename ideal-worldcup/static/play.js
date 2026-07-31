// 대결 화면: 다음 매치를 받아와 두 후보를 보여주고, 클릭하면 투표 후 다음 매치를 다시 불러옴.

const params = new URLSearchParams(window.location.search);
const tournamentId = params.get("id");
const vsWrap = document.getElementById("vs-wrap");
const progressEl = document.getElementById("progress");

function candidateCardHtml(side, candidate) {
  const image = candidate.image_url || "";
  return `
    <div class="battle-side" data-side="${side}">
      ${image ? `<img src="${image}" alt="" onerror="this.style.visibility='hidden'" />` : ""}
      <div class="name">${candidate.name}</div>
    </div>
  `;
}

async function loadNextMatch() {
  const match = await api.nextMatch(tournamentId);
  if (!match) {
    window.location.href = `/result.html?id=${tournamentId}`;
    return;
  }

  progressEl.textContent =
    `${match.tournament_title}   ${match.round_label}   ${match.match_position}/${match.matches_in_round}`;

  vsWrap.innerHTML = `
    ${candidateCardHtml("a", { name: match.a_name, image_url: match.a_image_url })}
    <div class="battle-vs">VS</div>
    ${candidateCardHtml("b", { name: match.b_name, image_url: match.b_image_url })}
  `;

  vsWrap.querySelector('[data-side="a"]').onclick = () => vote(match.match_id, match.a_id);
  vsWrap.querySelector('[data-side="b"]').onclick = () => vote(match.match_id, match.b_id);
}

async function vote(matchId, winnerId) {
  await api.vote(tournamentId, matchId, winnerId);
  loadNextMatch();
}

loadNextMatch();
