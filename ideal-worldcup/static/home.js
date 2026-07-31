// 대회 목록 표시 + 새 대회 만들기 폼 처리.

const listEl = document.getElementById("tournament-list");
const candidateInputsEl = document.getElementById("candidate-inputs");
const sizeEl = document.getElementById("size");
const savedNamesEl = document.getElementById("saved-candidate-names");
const quickStartCategoryEl = document.getElementById("quick-start-category");
const quickStartSizesEl = document.getElementById("quick-start-sizes");

// 카테고리는 지금은 "여자 아이돌" 하나뿐 -- 나중에 더 추가되면 여기서 여러 개를 골라 쓸 수 있게 됨.
let currentCategory = null;

async function loadQuickStart() {
  const categories = await api.categories();
  currentCategory = categories[0];
  if (!currentCategory) return;

  quickStartCategoryEl.textContent = currentCategory.title;
  const sizes = [4, 8, 16, 32].filter((n) => n <= currentCategory.pool_size);
  quickStartSizesEl.innerHTML = sizes.map((n) => `<button type="button" data-size="${n}">${n}강</button>`).join("");
}

quickStartSizesEl.addEventListener("click", async (e) => {
  const size = e.target.dataset.size;
  if (!size || !currentCategory) return;
  const { id } = await api.quickStart(currentCategory.key, Number(size));
  window.location.href = `/play.html?id=${id}`;
});

// 이름 -> 이미지 URL. 후보 이름을 입력하다가 예전에 저장해둔 이름과 일치하면
// 이미지 URL을 자동으로 채워준다 (이미지 칸이 비어있을 때만 -- 직접 입력한 값은 안 건드림).
let libraryByName = {};

async function loadCandidateLibrary() {
  const entries = await api.candidateLibrary();
  libraryByName = Object.fromEntries(entries.map((e) => [e.name, e.image_url]));
  savedNamesEl.innerHTML = entries.map((e) => `<option value="${e.name}"></option>`).join("");
}

function renderCandidateInputs() {
  const size = Number(sizeEl.value);
  candidateInputsEl.innerHTML = "";
  for (let i = 0; i < size; i++) {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `
      <input type="text" placeholder="후보 ${i + 1} 이름" data-role="name" list="saved-candidate-names" required />
      <input type="url" placeholder="이미지 URL (선택)" data-role="image" />
    `;
    const nameInput = row.querySelector('[data-role="name"]');
    const imageInput = row.querySelector('[data-role="image"]');
    nameInput.addEventListener("input", () => {
      const savedImage = libraryByName[nameInput.value.trim()];
      if (savedImage && !imageInput.value.trim()) {
        imageInput.value = savedImage;
      }
    });
    candidateInputsEl.appendChild(row);
  }
}

async function renderTournamentList() {
  const tournaments = await api.listTournaments();
  if (tournaments.length === 0) {
    listEl.innerHTML = `<p class="muted">아직 만든 대회가 없어요.</p>`;
    return;
  }
  listEl.innerHTML = tournaments
    .map(
      (t) => `
      <div class="card tournament-row">
        <div>
          <a href="/play.html?id=${t.id}">${t.title}</a>
          <div class="champion-tag">${t.champion_name ? `우승: ${t.champion_name}` : "진행 중"}</div>
        </div>
        <button class="btn-danger" data-delete="${t.id}">삭제</button>
      </div>
    `
    )
    .join("");
}

listEl.addEventListener("click", async (e) => {
  const id = e.target.dataset.delete;
  if (!id) return;
  if (!confirm("이 대회를 삭제할까요?")) return;
  await api.deleteTournament(id);
  renderTournamentList();
});

document.getElementById("create-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const rows = candidateInputsEl.querySelectorAll(".row");
  const candidates = Array.from(rows).map((row) => ({
    name: row.querySelector('[data-role="name"]').value.trim(),
    image_url: row.querySelector('[data-role="image"]').value.trim() || null,
  }));

  const { id } = await api.createTournament(title, candidates);
  window.location.href = `/play.html?id=${id}`;
});

sizeEl.addEventListener("change", renderCandidateInputs);

renderCandidateInputs();
renderTournamentList();
loadCandidateLibrary();
loadQuickStart();
