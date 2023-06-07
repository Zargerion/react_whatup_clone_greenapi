// Адрес для запросов
const URL = (idInstance, apiTokenInstance, action) => {
  return `https://api.green-api.com/waInstance${idInstance}/${action}/${apiTokenInstance}`;
};

// Проверяем статус авторизации на console.green-api.com
export async function getStateInstance(action, id, token) {
  const idInstance = id;
  const apiTokenInstance = token;
  try {
    const response = await fetch(URL(idInstance, apiTokenInstance, action));
    const responseData = await response.json();
    if (responseData.stateInstance) {
      return responseData;
    } else {
      throw new Error("Invalid response from server.");
    }
  } catch (error) {
    throw new Error(`Error during getStateInstance function: ${error}`);
  }
}

// Получим настройки аккаунта владельца (ownewId)
export async function getSettings(action, id, token) {
  const idInstance = id;
  const apiTokenInstance = token;
  try {
    const response = await fetch(URL(idInstance, apiTokenInstance, action));
    if (!response.ok) {
      throw new Error("Ошибка запроса getSettings");
    }
    if (response.ok) {
      const { wid } = await response.json(); // Деструктурируем полученный response
      return { wid };
    }
  } catch (error) {
    throw new Error(`Error during getUserStatus function: ${error}`);
  }
}

// Получить информацию о контакте (name и avatar)
export async function getContactInfo(action, id, token, phoneNumber) {
  const idInstance = id;
  const apiTokenInstance = token;
  const chatId = phoneNumber;
  try {
    const response = await fetch(URL(idInstance, apiTokenInstance, action), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatId: chatId,
      }),
    });
    if (!response.ok) {
      throw new Error("Ошибка запроса getContactInfo");
    }
    if (response.ok) {
      const { name, avatar } = await response.json(); // Деструктурируем полученный response
      return { name, avatar };
    }
    // Если ничего нет - ничего не делаем.
    return;
  } catch (error) {
    console.error("Ошибка запроса getContactInfo:", error);
  }
}

// Отправка сообщения
export async function sendMessage(outMessage, action, id, token, phoneNumber) {
  const idInstance = id;
  const apiTokenInstance = token;
  const chatId = phoneNumber;
  try {
    const response = await fetch(URL(idInstance, apiTokenInstance, action), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatId: chatId+"@c.us",
        message: outMessage,
      }),
    });
    if (!response.ok) {
      throw new Error("Ошибка отправки");
    }
  } catch (error) {
    console.error("Ошибка отправки:", error);
  }
}

// Получение уведомления (сообщения)
export async function ReceiveMessage(action, id, token, phoneNumber) {
  const idInstance = id;
  const apiTokenInstance = token;
  const chatId = phoneNumber+"@c.us";
  let responseData;
  try {
    const response = await fetch(URL(idInstance, apiTokenInstance, action));
    if (!response.ok) {
      throw new Error("Ошибка запроса на получение уведомлений");
    }
    responseData = await response.json(); // Сохраняем responseData
    if (
      responseData &&
      responseData.body.typeWebhook === "incomingMessageReceived"
    ) {
      const textMessage =
        responseData.body.messageData?.textMessageData?.textMessage;
      const sender = responseData.body.senderData?.sender;
      const senderName = responseData.body.senderData?.senderName;
      // Если сообщение от того, с кем ведется диалог.
      if (sender === chatId) {
        // Возвращаем объект с текстом сообщения, отправителем и именем отправителя
        return { textMessage, sender, senderName };
      }
    }
    // Если флага нет, ничего не делаем
    return;
  } catch (error) {
    console.error("Ошибка ReceiveMessage:", error);
  } finally {
    // В конце, если уведомление сушествует, то удаляем его на сервере.
    if (responseData) {
      const receiptId = responseData.receiptId;
      await DeleteNotification(idInstance, apiTokenInstance, receiptId);
    }
  }
}

// Удаленине уведомления
async function DeleteNotification(idInstance, apiTokenInstance, receiptId) {
  try {
    const deleteUrl = `https://api.green-api.com/waInstance${idInstance}/DeleteNotification/${apiTokenInstance}/${receiptId}`;

    const response = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Ошибка запроса на удаление уведомления");
    }
  } catch (error) {
    console.error("Ошибка:", error);
  }
}

//Получение аватара отправителя
export async function getMyAvatar(action, id, token, owner_Id) {
  const idInstance = id;
  const apiTokenInstance = token;
  const ownerId = owner_Id;
  try {
    const response = await fetch(URL(idInstance, apiTokenInstance, action), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatId: ownerId,
      }),
    });
    if (!response.ok) {
      throw new Error("Ошибка запроса");
    }
    // Сохраняем responseData
    const responseData = await response.json();
    // Извлекаем адрес аватара
    if (responseData && responseData.existsWhatsapp === true) {
      return responseData.urlAvatar;
    }
  } catch (error) {
    console.error("Ошибка запроса:", error);
  }
}