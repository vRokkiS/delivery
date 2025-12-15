function pushNotifyCopied() {
    new Notify({
        text: 'Код готов!',
        speed: 200,
        autotimeout: 1000,
        position: 'right bottom',
    })
}

function pushNotifyLimit() {
    new Notify({
        status: 'error',
        title: 'Достигнут лимит корзины',
        text: 'Пожалуйста, удалите товар, прежде чем добавлять новый. Лимит - 5!',
        speed: 200,
        autotimeout: 1000,
        position: 'right bottom',
    })
}

function pushNotifyGetInfo() {
    new Notify({
        status: 'info',
        title: 'Небольшая инструкция',
        text: 'Скопируйте строку из реализации или чека и нажмите CTRL+V в любом месте на сайте. Посмотрите инструкцию для более полного понимания работы сайта',
        speed: 200,
        autotimeout: 10000,
        position: 'right bottom',
    })
}

let NotifyRestore;

function pushNotifyRestore() {
    NotifyRestore = new Notify({
        status: 'warning',
        title: 'Вернуть?',
        text: 'Нажмите что бы вернуть',
        customClass: 'undoNotification',
        speed: 200,
        autotimeout: 3000,
        showCloseButton: false,
        position: 'right bottom',
    })
}

// слушатель на запуск страницы

document.addEventListener('DOMContentLoaded', () => {
    loadShops(); 

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);
    const formattedDate = formatDate(futureDate);

    const dateInput = document.getElementById('deliveryDate');
    
    if (dateInput) {
        dateInput.value = formattedDate;
        dateInput.min = formattedDate;
    }

    const senderSelect = document.getElementById('sender');
    senderSelect.addEventListener('change', displayShopDetails);

    const recipientSelect = document.getElementById('recipient');
    recipientSelect.addEventListener('change', displayShopDetails);

    const selectedShop = document.getElementById('selectedShop');
    selectedShop.addEventListener('change', setSelectedShop);
});

// слушатель на вставку

document.addEventListener('paste', (event) => {
    const clipboardText = event.clipboardData.getData('text/plain').split("	");
    const cartItemsQuantity = document.getElementById("shoppingCart").querySelectorAll('tr').length;

    console.log("ITEMS: " + cartItemsQuantity);
    if (clipboardText.length > 1) {
        event.preventDefault(); 
        console.log('Вставленный текст:', clipboardText);
        
        if (cartItemsQuantity <= 5) {
            document.getElementById("shoppingCartInfo").classList.remove('hiddenCart');
            cart.add(clipboardText);
        } else {
            pushNotifyLimit();
        }
        
    } 
    else {
        console.log('Не то!');
    }
});

// установка автоматической даты

function formatDate(date) {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

// функция предпросмотра

let isPreviewAvaliable = true;
function showPreview() {
    if (isPreviewAvaliable) {
        document.getElementById("preview").classList.add('show');
        isPreviewAvaliable = false;
        addPreviewInfo();
    }
    else {
        document.getElementById("preview").classList.remove('show');
        isPreviewAvaliable = true;
    }
    
}

// функция сохранения текущего магазина

function pageReload() {
    const selectedName = localStorage.getItem('selectedShopName');
    const selectedID = localStorage.getItem('selectedShopID');
    
    document.getElementById("sender").value = selectedID;
    displayShopDetails({ target: document.getElementById("sender")})
    document.getElementById("shopName").innerHTML = selectedName;
}
function setSelectedShop(event) {
    const selectedName = event.target.options[event.target.selectedIndex].textContent;
    const selectedID = event.target.value;

    localStorage.setItem('selectedShopName', selectedName);
    localStorage.setItem('selectedShopID', selectedID);
    document.getElementById("shopName").innerHTML = selectedName;
}

// функция получения JSON с магазинами

let allShops = [];
async function loadShops() {
    try {
        const response = await fetch('data/shops.json'); 
        
        if (!response.ok) {
            throw new Error(`Ошибка загрузки: ${response.status} ${response.statusText}`);
        }
        
        allShops = await response.json(); 
        
        populateDropdown(allShops, "sender");
        populateDropdown(allShops, "recipient"); 
        populateDropdown(allShops, "selectedShop");
        pageReload();

    } catch (error) {
        console.error("Не удалось загрузить данные магазинов:", error);
    }
}

// функция заполнения выпадающих списков JSONом

function populateDropdown(shops, dropdown) {
    const selectElement = document.getElementById(dropdown);

    shops.forEach(shop => {
        const option = document.createElement('option');
        option.value = shop.id; 
        option.textContent = shop.name;
        selectElement.appendChild(option);
    });
}

// функция создания заявки?

// ТРЕБУЕТСЯ ВНИМАНИЕ   ТРЕБУЕТСЯ ВНИМАНИЕ   ТРЕБУЕТСЯ ВНИМАНИЕ   ТРЕБУЕТСЯ ВНИМАНИЕ      ТРЕБУЕТСЯ ВНИМАНИЕ      ТРЕБУЕТСЯ ВНИМАНИЕ   

function displayShopDetails(event) {
    const listType = event.target.id;
    const selectedId = parseInt(event.target.value);
    
    if (!selectedId) {
        document.getElementById(listType + '-id').textContent = '';
        document.getElementById(listType + '-external').checked = true;
        document.getElementById(listType + '-name').textContent = '';
        document.getElementById(listType + '-index').textContent = '';
        document.getElementById(listType + '-region').textContent = '';
        document.getElementById(listType + '-city').textContent = '';
        document.getElementById(listType + '-street').textContent = '';
        document.getElementById(listType + '-building').textContent = '';
        document.getElementById(listType + '-flat').textContent = '';
        document.getElementById(listType + '-fullName').textContent = '';
        document.getElementById(listType + '-phoneNumber').textContent = '';
        return;
    }

    const selectedShop = allShops.find(shop => shop.id === selectedId);

    if (selectedShop) {
        document.getElementById(listType + '-id').textContent = selectedShop.id;
        document.getElementById(listType + '-external').checked = selectedShop.isExternal;
        document.getElementById(listType + '-name').textContent = selectedShop.name;
        document.getElementById(listType + '-index').textContent = selectedShop.index;
        document.getElementById(listType + '-region').textContent = selectedShop.region;
        document.getElementById(listType + '-city').textContent = selectedShop.city;
        document.getElementById(listType + '-street').textContent = selectedShop.street;
        document.getElementById(listType + '-building').textContent = selectedShop.building;
        document.getElementById(listType + '-flat').textContent = selectedShop.flat;
        document.getElementById(listType + '-fullName').textContent = selectedShop.fullName;
        document.getElementById(listType + '-phoneNumber').textContent = selectedShop.phoneNumber;
    }
}

// главный механизм работы с товарами в корзине

const cart = {
    undoTimeout: null,
    deletedItem: null,

    action(e) {
        if (e.target.closest('.undoNotification')) {
            e.preventDefault
            this.restoreLastItem();
            NotifyRestore.close();
            document.querySelectorAll('.undoNotification').forEach(el => el.remove());
            return;
        }

        const cartItem = e.target.closest('.itemDelete');
        
        if (cartItem) {
            e.preventDefault();

            const cartItem = e.target.closest('.itemDelete');
            const itemId = e.target.closest('.cartItem');
        
            this.saveDeletedItem(itemId);
            this.removeItem(itemId);
            pushNotifyRestore();
        }

        if (e.target.closest('.cartItemTD')) {
            const pickedItem = e.target.closest('.cartItemTD');
            navigator.clipboard.writeText(pickedItem.textContent)
            .then(() => {
                console.log("успешно скопировал!");
                this.showCopyNotification();
            })
            .catch(err => {
                console.log("ошибка при копировании: " + err);
            })

            return;
        }
    },

    saveDeletedItem(element) {
        this.deletedItem = element.outerHTML;
    },

    restoreLastItem() {
        if (this.deletedItem) {
            if (document.getElementById("shoppingCart").querySelectorAll('tr').length <= 5) {
            const cartItemsElement = document.querySelector('.cartItems');
            cartItemsElement.insertAdjacentHTML('beforeend', this.deletedItem);

            const restoredItem = cartItemsElement.lastElementChild;
            restoredItem.animate([
                { opacity: 0, transform: 'scale(0.98)' },
            { opacity: 1, transform: 'scale(1)' }
            ], {
                duration: 300,
                easing: 'ease-out'
            });

            this.deletedItem = null;
            } else {
                pushNotifyLimit();
            }
        }

        NotifyRestore.close();
    },

    add(clipboardData) {
        const cartItemsElement = document.querySelector('.cartItems');

        cartItemsElement.insertAdjacentHTML('beforeend', this.create(clipboardData));

        const newItem = cartItemsElement.lastElementChild;

        newItem.animate([
            { opacity: 0, transform: 'scale(0.98)' },
            { opacity: 1, transform: 'scale(1)' }
        ], {
            duration: 300,
            easing: 'ease-out'
        });
    },

    removeItem(element) {
        const cartItemsQuantity = document.getElementById("shoppingCart").querySelectorAll('tr').length;

        if (cartItemsQuantity <= 2) {
            document.getElementById("shoppingCartInfo").classList.add('hiddenCart');
        }

        const animation = element.animate([
            { opacity: 1, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(0.98)' }
        ], {
            duration: 0,
            easing: 'ease'
        });
        
        animation.onfinish = () => {
            element.remove();
        };
    },

    create(data) {
        return `<tr class="cartItem">
                <td class="itemArticle cartItemTD">${data[1]}</td>
                <td class="itemName cartItemTD">${data[2]}</td>
                <td class="itemCost cartItemTD">${data[9]}</td>
                <td><input type="text"  class="itemWidth cartItemTD" value="190"></input></td>
                <td><input type="text"  class="itemHeight" value="80"></input></td>
                <td><input type="text" class="itemDepth" value="20"></input></td>
                <th class="itemDelete" data-id="${data[1]}"><img src="media/x.png" height="32px" width="32px"></th>
            </tr>`
    },
    
    init() {
        document.addEventListener('click', this.action.bind(this));
    }
};

cart.init();

function createDelivery() {
    const deliveryDate = document.getElementById("deliveryDate").value.split('-');

    let senderName;
    let senderRegion;
    let recipientName;
    let recipientRegion;

    if (!document.getElementById("sender-external").checked) {
    senderName = allShops[(document.getElementById("sender-id").textContent)-1].officialName;
    senderRegion = allShops[(document.getElementById("sender-id").textContent)-1].regionSenderCode;
    } else {
    senderName = "";
    senderRegion = "";
    }

    if (!document.getElementById("recipient-external").checked) {
    recipientName = allShops[(document.getElementById("recipient-id").textContent)-1].officialName;
    recipientRegion = allShops[(document.getElementById("recipient-id").textContent)-1].regionRecipientCode;
    } else {
    recipientName = "";
    recipientRegion = "";
    }
    

    let deliveryType;
    if (document.getElementById("recipient-external").checked) {
        deliveryType = 2079; // доставка до клиента
    } else if (document.getElementById("sender-external").checked) {
        deliveryType = 2080; // доставка до магазина
    } else {
        deliveryType = 2080;
    }

    let observer;
    if (document.getElementById("observer").value == 102) {
        observer = `_addUserToList(${allShops[(document.getElementById("sender-id").textContent)-1].userId}, "Фирменный магазин ${allShops[(document.getElementById("sender-id").textContent)-1].officialName}", "", "#participants", undefined, undefined, !0, "GLOBAL_taskFormHubObserver.getBlocks()['taskparticipants'].removeUser(this," + 4020 + "); return false;").done(function(n) {})`;
    } else if (document.getElementById("observer").value == 101) {
        observer = ``;
    }

    let item1;
    if ((document.getElementById("shoppingCart").querySelectorAll('tr').length) > 1) {
        // Груз 1
        let cartRow = document.querySelectorAll('#shoppingCart tr:nth-child(1) td');
        item1 = `;document.querySelector('#field1657').value = "${cartRow[1].textContent}";
        document.querySelector('#field1658').value = 1;
        document.querySelector('#field1659').value = "${cartRow[2].textContent}";
        document.querySelector('#field1660').value = 1;
        document.querySelector('#field1661').value = "${cartRow[3].querySelector('input').value}";
        document.querySelector('#field1662').value = "${cartRow[4].querySelector('input').value}";
        document.querySelector('#field1663').value = "${cartRow[5].querySelector('input').value}";`
    }

    let item2;
    if ((document.getElementById("shoppingCart").querySelectorAll('tr').length) > 2) {
        // Груз 2
        let cartRow = document.querySelectorAll('#shoppingCart tr:nth-child(2) td');
        item2 = `;document.querySelector('#field1664').value = "${cartRow[1].textContent}";
        document.querySelector('#field1665').value = 1;
        document.querySelector('#field1666').value = "${cartRow[2].textContent}";
        document.querySelector('#field1667').value = 1;
        document.querySelector('#field1668').value = "${cartRow[3].querySelector('input').value}";
        document.querySelector('#field1669').value = "${cartRow[4].querySelector('input').value}";
        document.querySelector('#field1670').value = "${cartRow[5].querySelector('input').value}";`
    } else { item2 = '' }

    let item3;
    if ((document.getElementById("shoppingCart").querySelectorAll('tr').length) > 3) {
        // Груз 3
        let cartRow = document.querySelectorAll('#shoppingCart tr:nth-child(3) td');
        item3 = `;document.querySelector('#field1671').value = "${cartRow[1].textContent}";
        document.querySelector('#field1672').value = 1;
        document.querySelector('#field1673').value = "${cartRow[2].textContent}";
        document.querySelector('#field1674').value = 1;
        document.querySelector('#field1675').value = "${cartRow[3].querySelector('input').value}";
        document.querySelector('#field1676').value = "${cartRow[4].querySelector('input').value}";
        document.querySelector('#field1677').value = "${cartRow[5].querySelector('input').value}";`
    } else { item3 = '' }

    let item4;
    if ((document.getElementById("shoppingCart").querySelectorAll('tr').length) > 4) {
        // Груз 4
        let cartRow = document.querySelectorAll('#shoppingCart tr:nth-child(4) td');
        item4 = `;document.querySelector('#field1678').value = "${cartRow[1].textContent}";
        document.querySelector('#field1679').value = 1;
        document.querySelector('#field1680').value = "${cartRow[2].textContent}";
        document.querySelector('#field1681').value = 1;
        document.querySelector('#field1682').value = "${cartRow[3].querySelector('input').value}";
        document.querySelector('#field1683').value = "${cartRow[4].querySelector('input').value}";
        document.querySelector('#field1684').value = "${cartRow[5].querySelector('input').value}";`
    } else { item4 = '' }

    let item5;
    if ((document.getElementById("shoppingCart").querySelectorAll('tr').length) > 5) {
        // Груз 5
        let cartRow = document.querySelectorAll('#shoppingCart tr:nth-child(5) td');
        item5 = `;document.querySelector('#field1685').value = "${cartRow[1].textContent}";
        document.querySelector('#field1686').value = 1;
        document.querySelector('#field1687').value = "${cartRow[2].textContent}";
        document.querySelector('#field1688').value = 1;
        document.querySelector('#field1689').value = "${cartRow[3].querySelector('input').value}";
        document.querySelector('#field1690').value = "${cartRow[4].querySelector('input').value}";
        document.querySelector('#field1691').value = "${cartRow[5].querySelector('input').value}";`
    } else { item5 = '' }
    

    return `
    document.getElementById('description').textContent = "${document.getElementById("description").value}";
    document.getElementById('deadline').value = "${deliveryDate[2]}.${deliveryDate[1]}.${deliveryDate[0]} 23:59";
    document.querySelector('#field2393 option[value="${deliveryType}"]').selected = true;
    document.querySelector('#field1628').checked = ${document.getElementById("sender-external").checked};
    document.querySelector('#field2429').value = "${senderName}";
    document.querySelector('#field1630').value = "${document.getElementById("sender-index").textContent}";
    document.querySelector('#field2412 option[value="${senderRegion}"]').selected = true;
    document.querySelector('#field1643').value = "${document.getElementById("sender-city").textContent}";
    document.querySelector('#field1644').value = "${document.getElementById("sender-street").textContent}";
    document.querySelector('#field1645').value = "${document.getElementById("sender-building").textContent}";
    document.querySelector('#field1646').value = "${document.getElementById("sender-flat").textContent}";
    document.querySelector('#field1631').value = "${document.getElementById("sender-fullName").textContent}";
    document.querySelector('#field1632').value = "${document.getElementById("sender-phoneNumber").textContent}";
    document.querySelector('#field1633').value = "${deliveryDate[2]}.${deliveryDate[1]}.${deliveryDate[0]} 23:59";
    document.querySelector('#field1635').checked = ${document.getElementById("recipient-external").checked};
    document.querySelector('#field2430').value = "${recipientName}";
    document.querySelector('#field1651').value = "${document.getElementById("recipient-index").textContent}";
    document.querySelector('#field2413 option[value="${recipientRegion}"]').selected = true;
    document.querySelector('#field1647').value = "${document.getElementById("recipient-city").textContent}";
    document.querySelector('#field1648').value = "${document.getElementById("recipient-street").textContent}";
    document.querySelector('#field1649').value = "${document.getElementById("recipient-building").textContent}";
    document.querySelector('#field1650').value = "${document.getElementById("recipient-flat").textContent}";
    document.querySelector('#field1638').value = "${document.getElementById("recipient-fullName").textContent}";
    document.querySelector('#field1639').value = "${document.getElementById("recipient-phoneNumber").textContent}";
    document.querySelector('#field1640').value = "${deliveryDate[2]}.${deliveryDate[1]}.${deliveryDate[0]} 23:59";
    document.querySelector('#field1641 option[value="${document.getElementById("deliveryTime").value}"]').selected = true;
    ${observer}
    ${item1}
    ${item2}
    ${item3}
    ${item4}
    ${item5}
    `;
}

function addPreviewInfo() {
    const deliveryDate = document.getElementById("deliveryDate").value.split('-');

    let deliveryType;
    if (document.getElementById("recipient-external").checked) {
        deliveryType = "доставка до клиента"; // доставка до клиента
    } else if (document.getElementById("sender-external").checked) {
        deliveryType = "доставка до магазина"; // доставка до магазина
    } else {
        deliveryType = "доставка до магазина";
    }

    let observer;
    if (document.getElementById("observer").value == 102) {
        observer = `_addUserToList(${allShops[(document.getElementById("sender-id").textContent)-1].userId}, "Фирменный магазин ${allShops[(document.getElementById("sender-id").textContent)-1].officialName}", "", "#participants", undefined, undefined, !0, "GLOBAL_taskFormHubObserver.getBlocks()['taskparticipants'].removeUser(this," + 4020 + "); return false;").done(function(n) {})`;
    } else if (document.getElementById("observer").value == 101) {
        observer = ``;
    }

    let item1;
    if ((document.getElementById("shoppingCart").querySelectorAll('tr').length) > 1) {
        // Груз 1
        let cartRow = document.querySelectorAll('#shoppingCart tr:nth-child(1) td');
        item1 = `;document.querySelector('#field1657').value = "${cartRow[1].textContent}";
        document.querySelector('#field1658').value = 1;
        document.querySelector('#field1659').value = "${cartRow[2].textContent}";
        document.querySelector('#field1660').value = 1;
        document.querySelector('#field1661').value = "${cartRow[3].querySelector('input').value}";
        document.querySelector('#field1662').value = "${cartRow[4].querySelector('input').value}";
        document.querySelector('#field1663').value = "${cartRow[5].querySelector('input').value}";`
    }

    let item2;
    if ((document.getElementById("shoppingCart").querySelectorAll('tr').length) > 2) {
        // Груз 2
        let cartRow = document.querySelectorAll('#shoppingCart tr:nth-child(2) td');
        item2 = `;document.querySelector('#field1664').value = "${cartRow[1].textContent}";
        document.querySelector('#field1665').value = 1;
        document.querySelector('#field1666').value = "${cartRow[2].textContent}";
        document.querySelector('#field1667').value = 1;
        document.querySelector('#field1668').value = "${cartRow[3].querySelector('input').value}";
        document.querySelector('#field1669').value = "${cartRow[4].querySelector('input').value}";
        document.querySelector('#field1670').value = "${cartRow[5].querySelector('input').value}";`
    } else { item2 = '' }

    let item3;
    if ((document.getElementById("shoppingCart").querySelectorAll('tr').length) > 3) {
        // Груз 3
        let cartRow = document.querySelectorAll('#shoppingCart tr:nth-child(3) td');
        item3 = `;document.querySelector('#field1671').value = "${cartRow[1].textContent}";
        document.querySelector('#field1672').value = 1;
        document.querySelector('#field1673').value = "${cartRow[2].textContent}";
        document.querySelector('#field1674').value = 1;
        document.querySelector('#field1675').value = "${cartRow[3].querySelector('input').value}";
        document.querySelector('#field1676').value = "${cartRow[4].querySelector('input').value}";
        document.querySelector('#field1677').value = "${cartRow[5].querySelector('input').value}";`
    } else { item3 = '' }

    let item4;
    if ((document.getElementById("shoppingCart").querySelectorAll('tr').length) > 4) {
        // Груз 4
        let cartRow = document.querySelectorAll('#shoppingCart tr:nth-child(4) td');
        item4 = `;document.querySelector('#field1678').value = "${cartRow[1].textContent}";
        document.querySelector('#field1679').value = 1;
        document.querySelector('#field1680').value = "${cartRow[2].textContent}";
        document.querySelector('#field1681').value = 1;
        document.querySelector('#field1682').value = "${cartRow[3].querySelector('input').value}";
        document.querySelector('#field1683').value = "${cartRow[4].querySelector('input').value}";
        document.querySelector('#field1684').value = "${cartRow[5].querySelector('input').value}";`
    } else { item4 = '' }

    let item5;
    if ((document.getElementById("shoppingCart").querySelectorAll('tr').length) > 5) {
        // Груз 5
        let cartRow = document.querySelectorAll('#shoppingCart tr:nth-child(5) td');
        item5 = `;document.querySelector('#field1685').value = "${cartRow[1].textContent}";
        document.querySelector('#field1686').value = 1;
        document.querySelector('#field1687').value = "${cartRow[2].textContent}";
        document.querySelector('#field1688').value = 1;
        document.querySelector('#field1689').value = "${cartRow[3].querySelector('input').value}";
        document.querySelector('#field1690').value = "${cartRow[4].querySelector('input').value}";
        document.querySelector('#field1691').value = "${cartRow[5].querySelector('input').value}";`
    } else { item5 = '' }
    
    document.getElementById("descriptionPreview").textContent = document.getElementById("description").value;
    document.getElementById("deadline").textContent = deliveryDate[2] + "." + deliveryDate[1] + "." + deliveryDate[0];
    document.getElementById("field2393").textContent = deliveryType;
    document.getElementById("field1641").textContent = document.querySelector('#deliveryTime option:checked').textContent;
}

function closePreview() {
    document.getElementById("preview").classList.remove('show');
    isPreviewAvaliable = true;
}

function closeSavePreview() {
    document.getElementById("preview").classList.remove('show');
    isPreviewAvaliable = true;
    
    navigator.clipboard.writeText(createDelivery());
    console.log("успешно скопировал!");    
    pushNotifyCopied();
}


