function goTo(target) {
    if (target == 'delivery') {
        document.getElementById("preview__delivery").classList.remove("hide");
        document.getElementById("deliveryData").classList.remove("hide");
        document.getElementById("createDocs__btn__create").classList.remove("hide");
        
        document.getElementById("tmzPreview").classList.add("hide");
        document.getElementById("tmzData").classList.add("hide");
        document.getElementById("createDocs__btn__download").classList.add("hide");
    
        document.querySelector(".mainHeader").classList.add("deliveryStylesheet");
        document.querySelector(".mainHeader").classList.remove("tmzStylesheet");

        document.getElementById("toggleDelivery").classList.add("active");
        document.getElementById("toggleTMZ").classList.remove("active");
    } else {
        document.getElementById("preview__delivery").classList.add("hide");
        document.getElementById("deliveryData").classList.add("hide");
        document.getElementById("createDocs__btn__create").classList.add("hide");
        
        document.getElementById("tmzPreview").classList.remove("hide");
        document.getElementById("tmzData").classList.remove("hide");
        document.getElementById("createDocs__btn__download").classList.remove("hide");

        document.querySelector(".mainHeader").classList.remove("deliveryStylesheet");
        document.querySelector(".mainHeader").classList.add("tmzStylesheet");

        document.getElementById("toggleDelivery").classList.remove("active");
        document.getElementById("toggleTMZ").classList.add("active");
    }
}

let allShops = [];
async function loadShops() {
    try {
        const response = await fetch('data/shops.json'); 
        
        if (!response.ok) {
            throw new Error(`Ошибка загрузки: ${response.status} ${response.statusText}`);
        }
        
        allShops = await response.json(); 
        
        populateDropdown(allShops, "deliveryData--sender");
        populateDropdown(allShops, "deliveryData--recipient"); 

        const selectedID = localStorage.getItem('selectedShopID');
        document.getElementById("deliveryData--sender").value = selectedID;

    } catch (error) {
        console.error("Не удалось загрузить данные магазинов:", error);
    }
}

const senderSelect = document.getElementById('deliveryData--sender')
senderSelect.addEventListener('change', (event) => {
    displayShopDetails(event);

    const selectedValue = event.target.value;
    localStorage.setItem('selectedShopID', selectedValue);
});

const recipientSelect = document.getElementById('deliveryData--recipient')
recipientSelect.addEventListener('change', (event) => {
    displayShopDetails(event);
});

function populateDropdown(shops, dropdown) {
    const selectElement = document.getElementById(dropdown);

    shops.forEach(shop => {
        const option = document.createElement('option');
        option.value = shop.id; 
        option.textContent = shop.name;
        selectElement.appendChild(option);
    });
}

function displayShopDetails(element) {
    const target = element.target ? element.target : element;
    
    const listType = target.id;
    const selectedId = parseInt(target.value) || 0;

    const id = document.getElementById(listType + '__id');
    const external = document.getElementById(listType + '__external');
    const index = document.getElementById(listType + '__index');
    const region = document.getElementById(listType + '__region');
    const city = document.getElementById(listType + '__city');
    const street = document.getElementById(listType + '__street');
    const house = document.getElementById(listType + '__house');
    const flat = document.getElementById(listType + '__flat');
    const name = document.getElementById(listType + '__name');
    const phone = document.getElementById(listType + '__phone');
    
    if (!selectedId) {
        id.value = '';
        external.checked = true;
        index.value = '';
        index.disabled = false;

        if (listType == "deliveryData--sender") {
            region.value = '2089';
            region.disabled = false;
        } else if (listType == "deliveryData--recipient") {
            region.value = '2181';
            region.disabled = false;
        }

        city.value = 'Санкт-Петербург';
        city.disabled = false;
        street.value = '';
        street.disabled = false;
        house.value = '';
        house.disabled = false;
        flat.value = '';
        flat.disabled = false;
        name.value = '';
        name.disabled = false;
        phone.value = '';
        phone.disabled = false;
        return;
    }

    const selectedShop = allShops.find(shop => shop.id === selectedId);

    if (selectedShop) {
        id.value = selectedShop.id;
        external.checked = selectedShop.isExternal;
        index.value = selectedShop.index;
        index.disabled = true;

        if (listType == "deliveryData--sender") {
            region.value = selectedShop.regionSenderCode;
            region.disabled = true;
        } else if (listType == "deliveryData--recipient") {
            region.value = selectedShop.regionRecipientCode;
            region.disabled = true;
        }
        
        city.value = selectedShop.city;
        city.disabled = true;
        street.value = selectedShop.street;
        street.disabled = true;
        house.value = selectedShop.building;
        house.disabled = true;
        flat.value = selectedShop.flat;
        flat.disabled = true;
        name.value = selectedShop.fullName;
        name.disabled = true;
        phone.value = selectedShop.phoneNumber;
        phone.disabled = true;
    }
}

const reasonSelect = document.getElementById('tmzData--reason')
reasonSelect.addEventListener('change', (event) => {
    const selectedValue = event.target.value;
    
    if (selectedValue == 1) { // CRM
        document.querySelector('.tmzData--crm__field').classList.remove('hide');
        document.querySelector('.tmzData--id__field').classList.remove('hide');
        document.getElementById('tmzData--id').placeholder = "SSB26Y00000020";
    } else if (selectedValue == 2) { // ЧЕК
        document.querySelector('.tmzData--crm__field').classList.add('hide');
        document.querySelector('.tmzData--id__field').classList.remove('hide');
        document.getElementById('tmzData--id').placeholder = "SSB26Y000000000000000079";
    } else if (selectedValue == 3) { // РЕАЛИЗАЦИЯ
        document.querySelector('.tmzData--crm__field').classList.add('hide');
        document.querySelector('.tmzData--id__field').classList.remove('hide');
        document.getElementById('tmzData--id').placeholder = "SSB26Y00009";
    }
});



const cart = {
    deletedStorage: [],

    add(data) {
        const cartItemsFolder = document.querySelector('.cartData__table tbody');
        const cartItems = document.querySelectorAll('.cartData__item');

        if (cartItems.length < 5) {
            cartItemsFolder.insertAdjacentHTML('beforeend', this.create(data));

            const newItem = cartItemsFolder.lastElementChild;
            this.applySavedSizes(newItem);

            newItem.animate([
                { opacity: 0, transform: 'scale(0.99)' },
                { opacity: 1, transform: 'scale(1)' }
            ], {
                duration: 300,
                easing: 'ease-out'
            });

            pushNotifyDraft();
            this.update();
        } else {
            pushNotifyLimit();
        }
    },

    create(data) {
        let article = "";
        let name = "";
        let quantity = "";
        let cost = "";

        if (data.length === 4) {
            article = data[0];
            name = data[1];
            quantity = data[2];
            cost = data[3];
        } else if (data.length === 3) {
            name = data[0];
            quantity = data[1];
            cost = data[2];
        }
        return `<tr class="cartData__item">
							<td><input type="number" class="input-id" value=""></input></td>
							<td><input type="text" class="input-article" value="${article}"></input></td>
							<td><input type="text" class="input-name" value="${name}"></input></td>
							<td><input type="number" class="input-quantity" value="${quantity}"></input></td>
							<td><input type="number" class="input-cost" value="${cost}"></input></td>
							<td><input type="number" class="input-width" value=""></input></td>
							<td><input type="number" class="input-height" value=""></input></td>
							<td><input type="number" class="input-depth" value=""></input></td>
							<td>
								<label class="checkboxContainer">
									<input type="checkbox">
									<span class="checkmark"></span>
								</label>
							</td>
						</tr>`
    },

    saveToStorage(element) {
        const inputs = element.querySelectorAll('input');
    
        inputs.forEach(input => {
            input.setAttribute('value', input.value);
        });

        this.deletedStorage.push(element.outerHTML);

        if (this.deletedStorage.length > 5) {
            this.deletedStorage.shift();
        }
    },

    restoreLast() {
        const cartItems = document.querySelectorAll('.cartData__item');

        if (this.deletedStorage.length === 0) {
            return;
        }

        if (cartItems.length < 5) {
            const tableBody = document.querySelector('.cartData__table tbody');
            const lastItemHTML = this.deletedStorage.pop();

            tableBody.insertAdjacentHTML('beforeend', lastItemHTML);

            const restoredItem = tableBody.lastElementChild;
            restoredItem.animate([
                { opacity: 0, transform: 'scale(0.98)' },
                { opacity: 1, transform: 'scale(1)' }
            ], {
                duration: 300,
                easing: 'ease-out'
            });

            this.update();
        } else {
            pushNotifyLimit();
            return;
        }
    },

    deleteItem(element) {
        this.saveToStorage(element);
        element.remove();
        pushNotifyDeleted();
        this.update();
    },

    deleteLastRow() {
        const tableBody = document.querySelector('.cartData__table tbody');
        const lastRow = tableBody.lastElementChild;

            if (lastRow) {
                this.deleteItem(lastRow);
            }
    },

    deleteCheckedRows() {
        const checkedBoxes = document.querySelectorAll('.cartData__table tbody input[type="checkbox"]:checked');

        if (checkedBoxes.length === 0) {
            return;
        }

        checkedBoxes.forEach(checkbox => {
            const row = checkbox.closest('.cartData__item');
            if (row) {
                this.deleteItem(row);
                
            }
        });
    },

    updateTMZ() {
        this.update();
        
        const TMZreason = document.getElementById('tmzData--reason').value;

        if (document.getElementById('tmzData--id').value == "") {
            pushNotifyIDError();
            error;
            return 0;
        }

        if (document.getElementById('tmzData--sap').value == "") {
            pushNotifySAPError();
            error;
            return 0;
        }

        if ((document.getElementById('tmzData--crm').value == "") & (TMZreason == 1)) {
            pushNotifyCRMError();
            error;
            return 0;
        }

        document.getElementById('i1').textContent = "Общество с ограниченной ответственностью 'Носимо', ИНН 7701349057, КПП 774950001, телефон: 8 800 700-00-88, 105066, Россия, Москва, ул. Спартаковская, дом № 21, " + allShops[(document.getElementById("deliveryData--sender__id").value)-1].officialName;

        const today = new Date();
        const formattedDate = formatDate(today).split('-');

        document.getElementById('i2').textContent = document.getElementById('tmzData--id').value
        document.getElementById('i3').textContent = formattedDate[2] + "." + formattedDate[1] + "." + formattedDate[0];

        JsBarcode("#barcode", document.getElementById('tmzData--sap').value, {
            format: "CODE128",
            lineColor: "#000",
            margin: 0,
            width: 2,
            height: 35,
            displayValue: false
        });

        /* НЕ НУЖНО??
        // document.querySelectorAll('номер накладной').forEach(el => {
        //      el.textContent = document.getElementById('tmzData--sap').value
        // }

        if (TMZreason == 1) {
            // document.querySelectorAll('номер заказа').forEach(el => {
            // el.textContent = document.getElementById('tmzData--crm').value
            // }
        } else {
            // document.querySelectorAll('номер заказа').forEach(el => {
            // el.textContent = document.getElementById('tmzData--id').value
            // }
        } */

        const tmzSAP = document.getElementById('tmzData--sap').value;
        let tmzNumber = null;
        if (TMZreason == 1) {
            tmzNumber = document.getElementById('tmzData--crm').value
        } else {
            tmzNumber = document.getElementById('tmzData--id').value
        }
        
        const cartItems = document.querySelectorAll('.cartData__item');
        const tmzTable = document.querySelector('.pdf--cartItems');

        let totalQuantity = 0;
        let totalCost = 0;

        cartItems.forEach(item => {
            const id = item.querySelector('.input-id').value;
            const article = item.querySelector('.input-article').value;
            const name = item.querySelector('.input-name').value;
            const quantity = item.querySelector('.input-quantity').value;
            const cost = item.querySelector('.input-cost').value;
            totalQuantity += parseInt(quantity);
            totalCost += parseInt(quantity * cost);
            
            const row = `<tr class="pdf--item pdf--tdNoPadding">
                                        <td class="pdf--editable" style="border-left: 1px solid black">${id}</td>
                                        <td class="pdf--editable soft-pdf--editable"><div>${tmzNumber}</div></td>
                                        <td class="pdf--editable soft-pdf--editable"><div>${tmzSAP}</div></td>
                                        <td class="pdf--editable">ООО "НОСИМО"</td>
                                        <td class="pdf--editable">Физ. лицо</td>
                                        <td class="pdf--editable soft-pdf--editable"><div>${name}</div></td>
                                        <td class="pdf--editable soft-pdf--editable"><div>${article}</div></td>
                                        <td class="pdf--editable">шт</td>
                                        <td class="pdf--editable soft-pdf--editable pdf--quantity"><div>${quantity}</div></td>
                                        <td class="pdf--editable soft-pdf--editable pdf--cost"><div>${cost}</div></td>
                                        <td class="pdf--editable pdf--totalCost"><div>${quantity * cost}</div></td>
                                    </tr>`;

            tmzTable.insertAdjacentHTML('beforeend', row);
        });

        document.getElementById('i6').textContent = totalCost;
        document.getElementById('i7').textContent = totalCost;
        document.getElementById('i4').textContent = totalQuantity;
        document.getElementById('i5').textContent = totalQuantity;

        document.getElementById('i8').textContent = numberToWords(document.querySelectorAll('.pdf--item').length);
        document.getElementById('i9').textContent = numberToWords(totalQuantity);
        document.getElementById('i10').textContent = numberToWords(totalCost);
    },

    update() {
        const cartItems = document.querySelectorAll('.cartData__item');
        const checkedBoxes = document.querySelectorAll('.cartData__table tbody input[type="checkbox"]:checked');
        
        const rows = document.querySelectorAll('.cartData__table tbody .cartData__item');
    
        rows.forEach((row, index) => {
            const indexInput = row.querySelector('td:first-child input');
            if (indexInput) {
                indexInput.value = index + 1;
            }
        });

        if (cartItems.length > 0) {
            document.querySelector('.cartData__table__header').classList.remove('hide');
            document.querySelector('.cartData__empty').classList.add('hide');

        } else {
            document.querySelector('.cartData__table__header').classList.add('hide');
            document.querySelector('.cartData__empty').classList.remove('hide');
        }

        if (cartItems.length === 0) {
            document.getElementById('menu-delete').classList.add('disabled');
            document.querySelector('#menu-delete span').classList.remove('hotkey');
            document.querySelector('#menu-delete span').classList.add('disabled');
            document.getElementById('menu-delete-all').classList.add('disabled');
        } else {
            document.getElementById('menu-delete').classList.remove('disabled');
            document.querySelector('#menu-delete span').classList.add('hotkey');
            document.querySelector('#menu-delete span').classList.remove('disabled');
            document.getElementById('menu-delete-all').classList.remove('disabled');
        }

        if (checkedBoxes.length === 0) {
            document.getElementById('menu-delete-all').classList.add('disabled');
        } else {
            document.getElementById('menu-delete-all').classList.remove('disabled');
        }

        if (cartItems.length === 5) {
            document.getElementById('menu-add').classList.add('disabled');
            document.querySelector('#menu-add span').classList.remove('hotkey');
            document.querySelector('#menu-add span').classList.add('disabled');
        } else {
            document.getElementById('menu-add').classList.remove('disabled');
            document.querySelector('#menu-add span').classList.add('hotkey');
            document.querySelector('#menu-add span').classList.remove('disabled');
        }

        if (this.deletedStorage.length === 0) {
            document.getElementById('menu-restore').classList.add('disabled');
            document.querySelector('#menu-restore span').classList.remove('hotkey');
            document.querySelector('#menu-restore span').classList.add('disabled');
        } else {
            document.getElementById('menu-restore').classList.remove('disabled');
            document.querySelector('#menu-restore span').classList.add('hotkey');
            document.querySelector('#menu-restore span').classList.remove('disabled');
        }
    },

    applySavedSizes(row) {
        const articleInput = row.querySelector('.input-article');
        if (!articleInput) return;

        const article = articleInput.value.trim();
        if (!article) return;

        const savedData = JSON.parse(localStorage.getItem('articleSizes') || '{}');

        if (savedData[article]) {
            const sizes = savedData[article];
            
            const wField = row.querySelector('.input-width');
            const hField = row.querySelector('.input-height');
            const dField = row.querySelector('.input-depth');

            if (wField) wField.value = sizes.w;
            if (hField) hField.value = sizes.h;
            if (dField) dField.value = sizes.d;
        }
    }
};

function cleanupDatabase() {
    const db = JSON.parse(localStorage.getItem('articleSizes') || '{}');
    const keys = Object.keys(db);

    if (keys.length > 6000) {
        const sortedKeys = keys.sort((a, b) => db[a].lastUsed - db[b].lastUsed);
        
        sortedKeys.slice(0, 1000).forEach(key => delete db[key]);
        
        localStorage.setItem('articleSizes', JSON.stringify(db));
        pushNotifyDeletedDB();
    }
}

function saveSizesToLocal() {
    const rows = document.querySelectorAll('.cartData__item');
    const currentDatabase = JSON.parse(localStorage.getItem('articleSizes') || '{}');

    rows.forEach(row => {
        const article = row.querySelector('.input-article').value.trim();
        const w = row.querySelector('.input-width').value;
        const h = row.querySelector('.input-height').value;
        const d = row.querySelector('.input-depth').value;

        if (article && w && h && d) {
            currentDatabase[article] = { w, h, d };
        }
    });

    localStorage.setItem('articleSizes', JSON.stringify(currentDatabase));
}

const table = document.querySelector('.cartData__table');

table.addEventListener('input', (e) => {
    if (e.target.classList.contains('input-article')) {
        const article = e.target.value.trim();
        const savedData = JSON.parse(localStorage.getItem('articleSizes') || '{}');

        if (savedData[article]) {
            const row = e.target.closest('tr');
            const sizes = savedData[article];
            
            row.querySelector('.input-width').value = sizes.w;
            row.querySelector('.input-height').value = sizes.h;
            row.querySelector('.input-depth').value = sizes.d;
        }
    }
});

table.addEventListener('change', (e) => {
    if (e.target.type === 'checkbox') {
        cart.update();
    }
});

function formatDate(date) {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

document.addEventListener('paste', (event) => {
    const clipboardText = event.clipboardData.getData('text/plain').split("	");
    let data = null;

    if (clipboardText.length === 23) {
        const article = clipboardText[1];
        const name = clipboardText[2];
        const quantity = clipboardText[6].split(',')[0].replace(/\D/g, '');
        const cost = clipboardText[9].split(',')[0].replace(/\D/g, '');

        data = [article, name, quantity, cost];

    } else if (clipboardText.length === 19) {
        const name = clipboardText[1];
        const quantity = clipboardText[3].split(',')[0].replace(/\D/g, '');
        const cost = clipboardText[6].split(',')[0].replace(/\D/g, '');

        data = [name, quantity, cost];
    }

    if (data) {
        event.preventDefault(); 
        console.log('Вставленный текст:', data);
        
        cart.add(data);
    } 
    else {
        console.log('Неправильный элемент, размер - ' + clipboardText.length);
    }
});

document.addEventListener('DOMContentLoaded', () => { 
    loadShops().then(() => {
        const senderSelect = document.getElementById("deliveryData--sender");
        const recipientSelect = document.getElementById("deliveryData--recipient");

        if (senderSelect) displayShopDetails(senderSelect);
        if (recipientSelect) displayShopDetails(recipientSelect);
    });
    cleanupDatabase();
    cart.update();

    IMask(
    document.getElementById('deliveryData--sender__phone'),
    {
        mask: '+{7} (000) 000-00-00',
        lazy: true
    })

    IMask(
    document.getElementById('deliveryData--recipient__phone'),
    {
        mask: '+{7} (000) 000-00-00',
        lazy: true
    })

    IMask(
    document.getElementById('tmzData--crm'),
    {
        mask: '{4}-000-00000',
        lazy: true
    })

    JsBarcode("#barcode", "0000000", {
        format: "CODE128",
        lineColor: "#000",
        margin: 0,
        width: 2,
        height: 35,
        displayValue: false
    });

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);
    const formattedDate = formatDate(futureDate);

    const dateInput = document.getElementById('deliveryData--date');
    
    if (dateInput) {
        dateInput.value = formattedDate;
        dateInput.min = formattedDate;
    }

    displayShopDetails(document.getElementById("deliveryData--sender"));
});

// Контекстное меню

const menu = document.getElementById('context-menu');
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();

  const { clientX: mouseX, clientY: mouseY } = e;

  menu.style.top = `${mouseY}px`;
  menu.style.left = `${mouseX}px`;

  menu.style.display = 'flex';
});

document.addEventListener('click', (e) => {
  if (!menu.contains(e.target)) {
    menu.style.display = 'none';
  }
});

menu.addEventListener('click', (e) => {
  const option = e.target.closest('.menuOption');

  if (option) {
    if (option.id === 'menu-add') {
      cart.add("");
    } else if (option.id === 'menu-delete') {
      cart.deleteLastRow();
    } else if (option.id === 'menu-delete-all') {
      cart.deleteCheckedRows();
    } else if (option.id === 'menu-restore') {
      cart.restoreLast();
    }
    menu.style.display = 'none';
  }
});

// Горячие клавиши

document.addEventListener('keydown', (e) => {
    const isMeta = e.ctrlKey || e.metaKey;

    if (isMeta && e.code === 'KeyZ') {
        e.preventDefault(); 
        cart.restoreLast();
    }

    if (isMeta && e.code === 'Enter') {
        e.preventDefault();
        cart.add(""); 
    }

    if (isMeta && e.code === 'Delete') {
        e.preventDefault();
        cart.deleteLastRow(); 
    }
});

// Создание заявки

document.getElementById('createDocs__btn__create').addEventListener('click', () => {
    saveSizesToLocal();
    createDelivery();
    navigator.clipboard.writeText(createDelivery());
    pushNotifyCopied();
});

function createDelivery() {
    const deliveryDate = document.getElementById("deliveryData--date").value.split('-');

    let senderExtrenal = document.getElementById('deliveryData--sender__external').checked;
    let senderOfficialName;
    if (!senderExtrenal) {
        senderOfficialName = allShops[(document.getElementById("deliveryData--sender__id").value)-1].officialName;
    } else {
        senderOfficialName = 'Клиент';
    }
    let senderIndex = document.getElementById('deliveryData--sender__index').value;
    let senderRegion = document.getElementById('deliveryData--sender__region').value;
    let senderCity = document.getElementById('deliveryData--sender__city').value;
    let senderStreet = document.getElementById('deliveryData--sender__street').value;
    let senderHouse = document.getElementById('deliveryData--sender__house').value;
    let senderFlat = document.getElementById('deliveryData--sender__flat').value;
    let senderName = document.getElementById('deliveryData--sender__name').value;
    let senderPhone = document.getElementById('deliveryData--sender__phone').value;

    let recipientExtrenal = document.getElementById('deliveryData--recipient__external').checked;
    let recipientOfficialName;
    if (!recipientExtrenal) {
        recipientOfficialName = allShops[(document.getElementById("deliveryData--recipient__id").value)-1].officialName;
    } else {
        recipientOfficialName = 'Клиент';
    }
    let recipientIndex = document.getElementById('deliveryData--recipient__index').value;
    let recipientRegion = document.getElementById('deliveryData--recipient__region').value;
    let recipientCity = document.getElementById('deliveryData--recipient__city').value;
    let recipientStreet = document.getElementById('deliveryData--recipient__street').value;
    let recipientHouse = document.getElementById('deliveryData--recipient__house').value;
    let recipientFlat = document.getElementById('deliveryData--recipient__flat').value;
    let recipientName = document.getElementById('deliveryData--recipient__name').value;
    let recipientPhone = document.getElementById('deliveryData--recipient__phone').value;

    let deliveryType;
    if (recipientExtrenal) {
        deliveryType = 2079; // доставка до клиента
    } else if (senderExtrenal) {
        deliveryType = 2080; // доставка до магазина
    } else {
        deliveryType = 2080;
    }

    let observer;
    if (document.getElementById("deliveryData--observer").value == 102) { // отправитель - наблюдатель
        observer = `_addUserToList(${allShops[(document.getElementById("deliveryData--sender__id").value)-1].userId}, "Фирменный магазин ${allShops[(document.getElementById("deliveryData--sender__id").value)-1].officialName}", "", "#participants", undefined, undefined, !0, "GLOBAL_taskFormHubObserver.getBlocks()['taskparticipants'].removeUser(this," + 4020 + "); return false;").done(function(n) {})`;
    } else if (document.getElementById("deliveryData--observer").value == 101) {
        observer = `console.log('наблюдатель не используется')`;
    }

    console.log(observer);
    console.log(allShops[(document.getElementById("deliveryData--sender__id").value)-1].userId);
    console.log(allShops[(document.getElementById("deliveryData--sender__id").value)-1].officialName);

    allShops[(document.getElementById("deliveryData--sender__id").value)-1].officialName;

    let item1;
    if ((document.querySelectorAll('.cartData__item').length) >= 1) {
        let cartRow = document.querySelector('.cartData__item:nth-child(1)');
        item1 = `;document.querySelector('#field1657').value = "${cartRow.querySelector('.input-name').value}";
        document.querySelector('#field1658').value = 1;
        document.querySelector('#field1659').value = "${cartRow.querySelector('.input-cost').value}";
        document.querySelector('#field1660').value = 1;
        document.querySelector('#field1661').value = "${cartRow.querySelector('.input-width').value}";
        document.querySelector('#field1662').value = "${cartRow.querySelector('.input-height').value}";
        document.querySelector('#field1663').value = "${cartRow.querySelector('.input-depth').value}";`
    } else { item1 = `console.log('1 позиции нет')` }

    let item2;
    if ((document.querySelectorAll('.cartData__item').length) >= 2) {
        let cartRow = document.querySelector('.cartData__item:nth-child(2)');
        item2 = `;document.querySelector('#field1664').value = "${cartRow.querySelector('.input-name').value}";
        document.querySelector('#field1665').value = 1;
        document.querySelector('#field1666').value = "${cartRow.querySelector('.input-cost').value}";
        document.querySelector('#field1667').value = 1;
        document.querySelector('#field1668').value = "${cartRow.querySelector('.input-width').value}";
        document.querySelector('#field1669').value = "${cartRow.querySelector('.input-height').value}";
        document.querySelector('#field1670').value = "${cartRow.querySelector('.input-depth').value}";`
    } else { item2 = `console.log('2 позиции нет')` }

    let item3;
    if ((document.querySelectorAll('.cartData__item').length) >= 3) {
        let cartRow = document.querySelector('.cartData__item:nth-child(3)');
        item3 = `;document.querySelector('#field1671').value = "${cartRow.querySelector('.input-name').value}";
        document.querySelector('#field1672').value = 1;
        document.querySelector('#field1673').value = "${cartRow.querySelector('.input-cost').value}";
        document.querySelector('#field1674').value = 1;
        document.querySelector('#field1675').value = "${cartRow.querySelector('.input-width').value}";
        document.querySelector('#field1676').value = "${cartRow.querySelector('.input-height').value}";
        document.querySelector('#field1677').value = "${cartRow.querySelector('.input-depth').value}";`
    } else { item3 = `console.log('3 позиции нет')` }

    let item4;
    if ((document.querySelectorAll('.cartData__item').length) >= 4) {
        let cartRow = document.querySelector('.cartData__item:nth-child(4)');
        item4 = `;document.querySelector('#field1678').value = "${cartRow.querySelector('.input-name').value}";
        document.querySelector('#field1679').value = 1;
        document.querySelector('#field1680').value = "${cartRow.querySelector('.input-cost').value}";
        document.querySelector('#field1681').value = 1;
        document.querySelector('#field1682').value = "${cartRow.querySelector('.input-width').value}";
        document.querySelector('#field1683').value = "${cartRow.querySelector('.input-height').value}";
        document.querySelector('#field1684').value = "${cartRow.querySelector('.input-depth').value}";`
    } else { item4 = `console.log('4 позиции нет')` }

    let item5;
    if ((document.querySelectorAll('.cartData__item').length) >= 5) {
        let cartRow = document.querySelector('.cartData__item:nth-child(5)');
        item5 = `;document.querySelector('#field1685').value = "${cartRow.querySelector('.input-name').value}";
        document.querySelector('#field1686').value = 1;
        document.querySelector('#field1687').value = "${cartRow.querySelector('.input-cost').value}";
        document.querySelector('#field1688').value = 1;
        document.querySelector('#field1689').value = "${cartRow.querySelector('.input-width').value}";
        document.querySelector('#field1690').value = "${cartRow.querySelector('.input-height').value}";
        document.querySelector('#field1691').value = "${cartRow.querySelector('.input-depth').value}";`
    } else { item5 = `console.log('5 позиции нет')` }
    
    return `
    document.getElementById('description').textContent = "${document.getElementById("deliveryData--name").value}";
    document.getElementById('deadline').value = "${deliveryDate[2]}.${deliveryDate[1]}.${deliveryDate[0]} 23:59";
    document.querySelector('#field2393 option[value="${deliveryType}"]').selected = true;
    document.querySelector('#field1628').checked = ${document.getElementById("deliveryData--sender__external").checked};
    document.querySelector('#field2429').value = "${senderOfficialName}";
    document.querySelector('#field1630').value = "${senderIndex}";
    document.querySelector('#field2412 option[value="${senderRegion}"]').selected = true;
    document.querySelector('#field1643').value = "${senderCity}";
    document.querySelector('#field1644').value = "${senderStreet}";
    document.querySelector('#field1645').value = "${senderHouse}";
    document.querySelector('#field1646').value = "${senderFlat}";
    document.querySelector('#field1631').value = "${senderName}";
    document.querySelector('#field1632').value = "${senderPhone}";
    document.querySelector('#field1633').value = "${deliveryDate[2]}.${deliveryDate[1]}.${deliveryDate[0]} 23:59";
    document.querySelector('#field1635').checked = ${document.getElementById("deliveryData--recipient__external").checked};
    document.querySelector('#field2430').value = "${recipientOfficialName}";
    document.querySelector('#field1651').value = "${recipientIndex}";
    document.querySelector('#field2413 option[value="${recipientRegion}"]').selected = true;
    document.querySelector('#field1647').value = "${recipientCity}";
    document.querySelector('#field1648').value = "${recipientStreet}";
    document.querySelector('#field1649').value = "${recipientHouse}";
    document.querySelector('#field1650').value = "${recipientFlat}";
    document.querySelector('#field1638').value = "${recipientName}";
    document.querySelector('#field1639').value = "${recipientPhone}";
    document.querySelector('#field1653').value = "${document.getElementById("deliveryData--comment").value}";
    document.querySelector('#field1640').value = "${deliveryDate[2]}.${deliveryDate[1]}.${deliveryDate[0]} 23:59";
    document.querySelector('#field1641 option[value="${document.getElementById("deliveryData-time").value}"]').selected = true;
    ${observer}
    ${item1}
    ${item2}
    ${item3}
    ${item4}
    ${item5}
   `; 
}