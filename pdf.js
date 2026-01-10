async function downloadPDF() {
    const form = document.getElementById('tmzData__table');

    const { jsPDF } = window.jspdf;
    const element = document.getElementById('pdf--area');
    element.classList.toggle("pdf--fixedHeight");
    
    const editableDivs = document.querySelectorAll('.pdf--area div.active');
    editableDivs.forEach(div => {
    div.classList.toggle('active');
    });

    element.style.height = 'auto';

    const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        windowWidth: 1122
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('l', 'mm', 'a4');
    const imgWidth = 297; 
    const pageHeight = 210; 
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
    }

    pdf.save("tmz.pdf");
    element.classList.toggle("pdf--fixedHeight");

    editableDivs.forEach(div => {
    div.classList.toggle('active');
    });
}

function makeEditable() {
    const pdfDivs = document.querySelectorAll('.pdf--area div');

    if (document.getElementById('pdf--edit').classList.contains('active')) {
        pdfDivs.forEach(div => {
            div.setAttribute('contenteditable', 'true');
            div.classList.toggle('active');
        })
    } else {
        pdfDivs.forEach(div => {
            div.setAttribute('contenteditable', 'false');
            div.classList.toggle('active');
        })
    }
};

const pdfArea = document.getElementById('pdf--areaFolder');

pdfArea.addEventListener('click', (event) => {
    if (event.target === event.currentTarget) {
        pdfArea.classList.toggle('hide');
        document.getElementById('createDocs__btn__download').classList.remove('hide');
        document.body.classList.toggle('modal-open');
    } else {
        console.log('Клик по внутреннему элементу: ничего не делаем');
    }
});