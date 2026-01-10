function pushNotifySale() {
    new Notify({
        title: 'Реализация',
        text: 'Товар добавлен!',
        speed: 200,
        autotimeout: 1000,
        position: 'right top',
    })
}

function pushNotifyDraft() {
    new Notify({
        text: 'Товар добавлен!',
        speed: 200,
        autotimeout: 1000,
        position: 'right top',
    })
}

function pushNotifyDeleted() {
    new Notify({
        status: 'warning',
        text: 'Товар удален',
        speed: 200,
        autotimeout: 1000,
        position: 'right top',
    })
}

function pushNotifyDeletedDB() {
    new Notify({
        status: 'warning',
        text: 'Очистка базы данных',
        speed: 200,
        autotimeout: 5000,
        position: 'right top',
    })
}

function pushNotifySAPError() {
    new Notify({
        status: 'error',
        text: 'Введите код SAP',
        speed: 200,
        autotimeout: 1000,
        position: 'right top',
    })
}

function pushNotifyIDError() {
    new Notify({
        status: 'error',
        text: 'Введите номер документа',
        speed: 200,
        autotimeout: 1000,
        position: 'right top',
    })
}

function pushNotifyCRMError() {
    new Notify({
        status: 'error',
        text: 'Введите номер заказа CRM',
        speed: 200,
        autotimeout: 1000,
        position: 'right top',
    })
}

function pushNotifyCopied() {
    new Notify({
        title: 'Готово',
        text: 'Вставьте код в IS',
        speed: 200,
        autotimeout: 1000,
        position: 'right top',
    })
}

function pushNotifyLimit() {
    new Notify({
        status: 'error',
        title: 'Достигнут лимит корзины',
        text: 'Пожалуйста, удалите товар, прежде чем добавлять новый. Лимит - 5!',
        speed: 200,
        autotimeout: 1000,
        position: 'right top',
    })
}

let NotifyInfo;

function pushNotifyGetInfo() {
    NotifyInfo = new Notify({
        status: 'info',
        title: 'Небольшая инструкция',
        text: 'Скопируйте строку из реализации или чека и нажмите CTRL+V в любом месте на сайте. Нажмите на уведомление что бы добавить позицию вручную',
        customClass: 'addManually',
        speed: 200,
        autotimeout: 10000,
        position: 'right top',
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
        position: 'right top',
    })
}