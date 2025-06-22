export function configurarEmojiGuiñador() {
  const emoji = document.getElementById("emoji-marvin");
  if (!emoji) return;

  const guiñar = () => {
    emoji.src = "assets/emojigui.webp";
    setTimeout(() => emoji.src = "assets/emoji.webp", 600);
  };

  setInterval(() => {
    if (Math.random() < 0.1) guiñar();
  }, 3000);
}