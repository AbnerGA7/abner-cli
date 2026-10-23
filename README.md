<div align="center">

<img src="https://raw.githubusercontent.com/AbnerGA7/abner-cli/main/assets/banner.svg" alt="ABNER — tu asistente de Git y GitHub en la terminal" width="100%">

<br>

**Inicia, guarda y sube tu código sin memorizar un solo comando de Git.**

<br>

[![npm](https://img.shields.io/npm/v/@abnerg7/abner?style=for-the-badge&color=a855f7&logo=npm&logoColor=white&label=npm)](https://www.npmjs.com/package/@abnerg7/abner)
[![node](https://img.shields.io/badge/node-%E2%89%A518-38bdf8?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![licencia](https://img.shields.io/badge/licencia-MIT-ff5fa2?style=for-the-badge)](LICENSE)
[![hecho en](https://img.shields.io/badge/hecho%20en-español-1a1230?style=for-the-badge)](#)

<br>

[**Instalación**](#-instalación) &nbsp;·&nbsp;
[**Uso**](#-uso) &nbsp;·&nbsp;
[**Todo en uno o detallado**](#-todo-en-uno-o-detallado) &nbsp;·&nbsp;
[**Preguntas**](#-preguntas-frecuentes)

</div>

<br>

## ⚡ Instalación

```bash
npm install -g @abnerg7/abner
```

Y ya está. Escribe **`abner`** en cualquier carpeta y aparece el menú. Para actualizar, repite el mismo comando.

<br>

## 🖥️ Así se ve

<div align="center">
<img src="https://raw.githubusercontent.com/AbnerGA7/abner-cli/main/assets/demo.svg" alt="Demo de abner sube" width="100%">
</div>

<br>

## ✨ Qué hace

<table>
<tr>
<td width="50%" valign="top">

### 🎛️ Menú con flechas
Escribe `abner` y elige. Nada de recordar comandos ni banderas raras.

</td>
<td width="50%" valign="top">

### 🧩 Todo en uno o detallado
Un commit rápido con todo, o varios commits ordenados eligiendo qué archivos van en cada uno.

</td>
</tr>
<tr>
<td valign="top">

### 🏷️ Mensajes con tipo
Eliges *Nueva función*, *Arreglo*, *Diseño*… y abner escribe `feat:`, `fix:`, `style:` por ti.

</td>
<td valign="top">

### 🛡️ Protege tus claves
Te avisa antes de subir `.env`, `.pem` o `credentials.json` y crea un `.gitignore` decente.

</td>
</tr>
<tr>
<td valign="top">

### 🔄 Pull antes de push
Trae lo que hay en GitHub antes de subir. Si hay conflicto, se detiene y tu commit queda a salvo.

</td>
<td valign="top">

### 🛠️ Configura todo solo
Instala GitHub CLI si falta, abre el navegador para conectar tu cuenta y crea el repo público o privado.

</td>
</tr>
<tr>
<td valign="top">

### ↩️ Deshacer seguro
Deshace el último commit sin perder archivos, y solo si todavía no se subió.

</td>
<td valign="top">

### 🔒 A prueba de errores
Los mensajes nunca pasan por la shell: comillas, `;` o `&` son solo texto. Sube a la rama en la que estés.

</td>
</tr>
</table>

<br>

## 🚀 Uso

| Comando | Qué hace |
|:--|:--|
| `abner` | Abre el menú |
| `abner nuevo` | `git init` + `.gitignore` + primer commit + repo en GitHub |
| `abner sube` | Guarda y sube; te pregunta si todo en uno o detallado |
| `abner sube "fix: menú"` | Un commit rápido con ese mensaje, sin preguntas |
| `abner commits` | Directo al modo detallado |
| `abner estado` | Qué falta guardar y qué falta subir |
| `abner historial` | Los últimos 15 commits |
| `abner deshacer` | Deshace el último commit (si no se subió) |
| `abner --help` | Ayuda |

<br>

## 🧩 Todo en uno o detallado

Cuando cambiaste varios archivos, `abner sube` te deja elegir:

<table>
<tr>
<th width="50%">📦 Todo en un solo commit</th>
<th width="50%">🧩 Commits detallados</th>
</tr>
<tr>
<td valign="top">

Para cambios pequeños o cuando tienes prisa.

```
✔ feat: pantalla de login
```

</td>
<td valign="top">

Para un historial limpio: cada commit cuenta una sola cosa.

```
✔ feat: pantalla de login
✔ style: colores del botón
✔ docs: actualiza README
```

</td>
</tr>
</table>

En el modo detallado marcas los archivos de cada commit con <kbd>Espacio</kbd> (o <kbd>A</kbd> para todos), escribes el mensaje y repites hasta terminar. Al final se sube todo de una vez.

<details>
<summary><b>🏷️ Tipos de commit disponibles</b></summary>
<br>

| Eliges | Se escribe |
|:--|:--|
| ✨ Nueva función | `feat:` |
| 🐛 Arreglo de error | `fix:` |
| 🎨 Diseño / estilos | `style:` |
| ♻️ Reorganizar código | `refactor:` |
| 📝 Documentación | `docs:` |
| 🔧 Configuración | `chore:` |

Siguen el estándar [Conventional Commits](https://www.conventionalcommits.org/es/).

</details>

<br>

## ❓ Preguntas frecuentes

<details>
<summary><b>¿Necesito saber Git?</b></summary>
<br>
No. abner te pregunta lo necesario en español y hace los comandos por ti. Si Git aún no sabe tu nombre o email, te los pide una sola vez.
</details>

<details>
<summary><b>¿Y si alguien más cambió el repo?</b></summary>
<br>
abner trae esos cambios antes de subir los tuyos. Si los dos tocaron las mismas líneas, se detiene sin romper nada, tus commits quedan guardados y te dice qué hacer.
</details>

<details>
<summary><b>¿Me puedo equivocar y subir una contraseña?</b></summary>
<br>
abner detecta archivos como <code>.env</code>, <code>.pem</code>, <code>.key</code> o <code>credentials.json</code> y te pregunta antes. Por defecto los deja fuera.
</details>

<details>
<summary><b>¿Funciona en Windows, Mac y Linux?</b></summary>
<br>
Sí. Solo necesitas <a href="https://nodejs.org">Node.js 18+</a> y <a href="https://git-scm.com">Git</a>. GitHub CLI lo instala abner si hace falta.
</details>

<details>
<summary><b>Quiero modificar el código</b></summary>
<br>

```bash
git clone https://github.com/AbnerGA7/abner-cli.git
cd abner-cli
npm install
npm link
```

```
bin/abner.js      punto de entrada y menú
src/comandos.js   nuevo, sube, commits, estado, historial, deshacer
src/git.js        llamadas seguras a git (sin shell)
src/ui.js         logo, colores y preguntas
```

</details>

<br>

<div align="center">

---

Hecho con 💜 por **[Abner](https://github.com/AbnerGA7)** · Licencia [MIT](LICENSE)

Si te sirvió, deja una ⭐ en el repo

</div>
