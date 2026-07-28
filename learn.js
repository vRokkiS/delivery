const accordionButtons = document.querySelectorAll('.accordion-btn');

accordionButtons.forEach(button => {
  button.addEventListener('click', () => {
    const targetKey = button.getAttribute('data-content');

    const targetContent = document.querySelector(`div.accordion-content[data-content="${targetKey}"]`);

    if (targetContent) {
      targetContent.classList.toggle('is-open');
    }
  });
});