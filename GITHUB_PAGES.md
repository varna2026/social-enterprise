# GitHub Pages — Безплатен хостинг на Интерактивната Карта

Картата е достъпна на: **https://varna2026.github.io/social-enterprise/**

---

## Как работи

```
Replit (пълна версия с Admin + база данни)
    ↓  node scripts/export-static.mjs     ← сваля данни + снимки
    ↓  pnpm build:static                  ← генерира HTML/JS/CSS
    ↓  git push → GitHub
    ↓  GitHub Actions                     ← автоматично качва на Pages
GitHub Pages (публична, безплатна карта)
```

---

## Публикуване за ПЪРВИ ПЪТ

### 1. Свържи Replit с GitHub

1. В Replit — кликни иконата **Git** в лявото меню (изглежда като разклонение)
2. Кликни **"Connect to GitHub"**
3. Влез с акаунта `varna2026` и разреши достъп
4. В полето за remote URL провери дали пише:
   `https://github.com/varna2026/social-enterprise.git`

### 2. Push към GitHub

В **Shell** таба на Replit:

```bash
git add .
git commit -m "Initial: static GitHub Pages version with 55 enterprises"
git push -u origin main
```

> Ако поиска username/password — въведи GitHub username и **Personal Access Token**
> (не паролата!). Токен се генерира от: GitHub → Settings → Developer settings →
> Personal access tokens → "Generate new token" → избери **repo** права.

### 3. Включи GitHub Pages

1. Отиди на **https://github.com/varna2026/social-enterprise/settings/pages**
2. В "Source" избери **"GitHub Actions"**
3. Запази

### 4. Изчакай автоматичния build (~2 мин)

Следи прогреса на: **https://github.com/varna2026/social-enterprise/actions**

Картата ще е достъпна на: **https://varna2026.github.io/social-enterprise/**

---

## При ОБНОВЯВАНЕ на данни (след промени в Replit Admin)

```bash
# В Shell на Replit:
node scripts/export-static.mjs
git add artifacts/social-map/public/data/
git commit -m "Update: refresh enterprise data"
git push
```

GitHub Actions автоматично ще rebuild-не и deploy-не. ~2 мин.

---

## Ако искаш САМО да свалиш готовите файлове (без git)

В корена на проекта има `dist-github-pages.tar.gz` — изтегли го и разархивирай.
Съдържа всички HTML/JS/CSS/снимки, готови за качване ръчно.

За ръчно качване:
1. GitHub → repo → Add file → Upload files
2. Провлачи всички файлове от архива
3. Commit

> Бележка: снимките са ~45MB — GitHub поддържа до 1GB за Pages.

---

## Структура на генерираните файлове

```
artifacts/social-map/public/data/
├── enterprises.json      ← 55 предприятия от базата данни
├── events.json           ← 6 събитие
└── images/               ← 107 снимки, свалени от Replit
    ├── 3d0cb481-...      ← UUID = оригиналното название от storage
    └── ...

artifacts/social-map/dist/github-pages/   ← готов сайт за deployment
```
