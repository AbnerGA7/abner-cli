<div align="center">

```
 █████  ██████  ███    ██ ███████ ██████
██   ██ ██   ██ ████   ██ ██      ██   ██
███████ ██████  ██ ██  ██ █████   ██████
██   ██ ██   ██ ██  ██ ██ ██      ██   ██
██   ██ ██████  ██   ████ ███████ ██   ██
```

### Tu asistente de Git y GitHub en la terminal

Inicia, guarda y sube tu código **sin memorizar comandos**.

[![npm](https://img.shields.io/npm/v/@abnerg7/abner?color=cb3837&logo=npm)](https://www.npmjs.com/package/@abnerg7/abner)
![node](https://img.shields.io/badge/node-%3E%3D18-5fa04e?logo=node.js&logoColor=white)
![license](https://img.shields.io/badge/licencia-MIT-8b5cf6)
![idioma](https://img.shields.io/badge/hecho%20en-español-ef4444)

</div>

---

## ✨ Qué hace

| | |
|---|---|
| 🎛️ **Menú con flechas** | Escribe `abner` y elige qué hacer. Nada de recordar comandos. |
| 🧩 **Todo en uno o detallado** | Al subir eliges: un solo commit rápido, o varios commits ordenados eligiendo qué archivos van en cada uno. |
| 🏷️ **Mensajes con tipo** | Eliges *Nueva función*, *Arreglo*, *Diseño*… y se escribe `feat:`, `fix:`, `style:` por ti. |
| 🛡️ **Protege tus claves** | Te avisa antes de subir `.env`, `.pem` o `credentials.json`, y crea un `.gitignore` decente. |
| 🔄 **Pull antes de push** | Trae lo que hay en GitHub antes de subir; si hay conflicto, se detiene sin romper nada. |
| 🌿 **Cualquier rama** | Sube a la rama en la que estás, no solo a `main`. |
| ↩️ **Deshacer seguro** | Deshace el último commit sin perder archivos, y solo si aún no se subió. |
| 🛠️ **Instala GitHub CLI por ti** | Si falta `gh`, te ofrece instalarlo (winget, brew o apt) y abre el navegador para conectar tu cuenta. |
| 🌐 **Crea el repo** | Público o privado, con el nombre de tu carpeta sugerido. |
| 🔒 **Sin inyección de comandos** | Los mensajes nunca pasan por la shell: comillas, `;` o `&` son solo texto. |

## 📦 Instalación

Un solo comando:

```bash
npm install -g @abnerg7/abner
```

Listo: el comando `abner` ya funciona en cualquier carpeta. Para actualizarlo, ejecuta el mismo comando otra vez.

<details>
<summary>¿Quieres modificar el código? Instálalo en modo desarrollo</summary>

```bash
git clone https://github.com/AbnerGA7/abner-cli.git
cd abner-cli
npm install
npm link
```

</details>

> Para crear repos desde la terminal necesitas [GitHub CLI](https://cli.github.com) (`winget install GitHub.cli`). Abner te lo recuerda si falta.

## 🚀 Uso

```bash
abner                   # abre el menú
abner nuevo             # git init + .gitignore + primer commit + repo en GitHub
abner sube              # te pregunta: ¿todo en uno o commits detallados?
abner sube "fix: menú"  # lo mismo, con el mensaje directo
abner commits           # varios commits separados por archivos
abner estado            # qué falta guardar y qué falta subir
abner historial         # últimos 15 commits
abner deshacer          # deshace el último commit (si no se subió)
```

## 🧩 Muchos commits, bien ordenados

¿Cambiaste diez archivos de cosas distintas? En vez de un commit gigante llamado *update*:

```
abner commits

◆ Commit #1 · quedan 10 archivo(s)
│ ◼ modificado  src/login.js
│ ◼ nuevo       src/login.css
│ ◻ modificado  README.md
│ ...
◆ ¿Qué tipo de cambio es?  ✨ Nueva función
◆ Describe el cambio       pantalla de login
✔ Commit #1: feat: pantalla de login

◆ Commit #2 · quedan 8 archivo(s)
...
◆ 3 commit(s) listos para subir. ¿Subirlos todos ahora?  Sí
✔ Subido a GitHub (main)
```

Cada commit cuenta una sola cosa, y tu historial queda limpio y fácil de revisar.

## 🗂️ Estructura

```
bin/abner.js      punto de entrada y menú
src/comandos.js   nuevo, sube, commits, estado, historial, deshacer
src/git.js        llamadas seguras a git (sin shell)
src/ui.js         banner, colores y preguntas
```

## 📄 Licencia

MIT © Abner
