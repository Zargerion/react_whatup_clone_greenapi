import React from 'react';
import { connect } from 'react-redux';

import {
    sendMessage,
    ReceiveMessage,
    getMyAvatar,
    getSettings
  } from "../utils/greenAPI";

const mapStateToProps = state => ({
    user: state.user
});

const setMyAvatar = async (object) => {
    const {token, id} = object.props.user;
    try {
        console.log(object.ownerId)
        const avatar = await getMyAvatar("GetAvatar", id, token, object.ownerId)
        object.myAvatarUrl = avatar
        console.log(avatar)
    } catch (error) {
        console.error("Problem with get getMyAvatar:", error);
    }
}

const setOwnerId = async (object) => {
    const {token, id} = object.props.user;
    try {
        const { wid: ownerId } = await getSettings("getSettings", id, token);
        object.ownerId = ownerId
        console.log(ownerId)
        await setMyAvatar(object);
    } catch (error) {
        console.error("Problem with get settings:", error);
    }
}

const fetchPhones = (object) => {
    const storedPhones = localStorage.getItem("phones");
    if (storedPhones) { 
        const parsedPhones = JSON.parse(storedPhones);
        object.setState({ phones: parsedPhones }); 
    }
};

class ChatPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            messages: [],
            text: '',
            phone: '',
            ownerId: null,
            myAvatarUrl: null,
            phones: [],
            phoneToSend: '',
            nowPhoneId: ''
        }
        this.intervalId = null;
    };

    componentDidMount() {
        setOwnerId(this);
        fetchPhones(this);
        console.log(this.state.phoneToSend)
        
        
        this.intervalId = setInterval(() => this.handleReceiveMessage(), 10000);

    };

    componentWillUnmount() {
        clearInterval(this.intervalId);
    }

    handleInputChangeText = (e) => {
        this.setState({ text: e.target.value })
    };

    handleInputChangePhoneNum = (e) => {
        this.setState({ phone: e.target.value })
    };

    handleSubmitPhone = (e) => {
        e.preventDefault();
        const PhoneId = new Date().getTime();
        const newPhone = {
        id: PhoneId,
        content: this.state.phone,
        chat: [],
        };

        const storedPhones = localStorage.getItem("phones");
        let updatedPhones = [];

        if (storedPhones) {
            const parsedPhones = JSON.parse(storedPhones);
            updatedPhones = [...parsedPhones, newPhone];
        } else {
            updatedPhones = [newPhone];
        }

        localStorage.setItem("phones", JSON.stringify(updatedPhones));
        this.setState({phones: updatedPhones, phone: ""});
    };

    handleDeletePhone = (phoneId) => {
        const storedPhones = localStorage.getItem("phones");
        if (storedPhones) {
            const parsedPhones = JSON.parse(storedPhones);

            const updatedPhones = parsedPhones.filter((phone) => phone.id !== phoneId);

            localStorage.setItem("phones", JSON.stringify(updatedPhones));

            this.setState({ phones: updatedPhones });
        }
    }

    handleSendMessage = async () => {
        const {token, id} = this.props.user;

        const storedPhones = localStorage.getItem("phones");
        const parsedPhones = storedPhones ? JSON.parse(storedPhones) : [];
        const phoneToUpdate = parsedPhones.find(phone => phone.id === this.state.nowPhoneId);



        try {
          await sendMessage(this.state.text, "SendMessage", id, token, this.state.phoneToSend)
            .then(() => {
                const newMessage = { 
                    text: this.state.text,               
                    type: "out", 
                    avatar: this.state.myAvatarUrl 
                };
                if (phoneToUpdate) {
                    phoneToUpdate.chat = [...this.state.messages, newMessage];
                }
                this.setState({
                    messages: [...this.state.messages, newMessage],
                    text: ''
                });
                localStorage.setItem("phones", JSON.stringify(parsedPhones));
                this.setState({ phones: parsedPhones});
            })
            .catch((error) => {
                console.error("Ошибка при получении ссылки на аватар:", error);
            });
        } catch (error) {
            console.error("Ошибка при отправке сообщения:", error);
        }
        
    };
    
    handleReceiveMessage = () => {
        console.log("1")
        if (this.state.phoneToSend !== '') {
            const {token, id} = this.props.user;

            const storedPhones = localStorage.getItem("phones");
            const parsedPhones = storedPhones ? JSON.parse(storedPhones) : [];
            const phoneToUpdate = parsedPhones.find(phone => phone.id === this.state.nowPhoneId);
            if (!phoneToUpdate) {
                return;
            }
            console.log("2")
            ReceiveMessage("ReceiveNotification", id, token, this.state.phoneToSend)
                .then((data) => {
                    console.log("3")
                    const newMessage = { 
                        text: data.textMessage,               
                        type: "in", 
                        avatar: this.state.myAvatarUrl 
                    };
                    if (phoneToUpdate) {
                        phoneToUpdate.chat = [...this.state.messages, newMessage];
                    }
                    this.setState({
                        messages: [...this.state.messages, newMessage],
                        text: ''
                    });
                    localStorage.setItem("phones", JSON.stringify(parsedPhones));
                    this.setState({ phones: parsedPhones});
                })
                .catch((error) => {
                console.error("Ошибка при получении входящего сообщения:", error);
            })
        }
    }
    
    handleClickPhone = (phoneI) => {
        this.setState({phoneToSend: phoneI.content, nowPhoneId: phoneI.id})
        const storedPhones = localStorage.getItem("phones");
        const parsedPhones = storedPhones ? JSON.parse(storedPhones) : [];
        const phoneItem = parsedPhones.find(phone => phone.id === phoneI.id);
        if (phoneItem) {
            this.setState({
                messages: phoneItem.chat,
            });
        }
    };

    handleDeleteMessage = (messageIndex) => {
        const storedPhones = localStorage.getItem("phones");
        const parsedPhones = storedPhones ? JSON.parse(storedPhones) : [];
        const phoneToUpdate = parsedPhones.find(phone => phone.id === this.state.nowPhoneId);
        phoneToUpdate.chat.splice(messageIndex, 1);
        this.setState({ phones: parsedPhones });
        this.setState({ messages: phoneToUpdate.chat });
        localStorage.setItem('phones', JSON.stringify(parsedPhones));
    }

    
    
    render() {
        return (
            <div className="App">
                <div className="chat-page p-4 bg-green-50 flex w-screen h-screen">
                    <div className="chats shadow-md bg-white w-1/4 border-r border-r-gray-200 overflow-y-auto">
                    
                        <div className="flex items-center justify-center p-3 border-b border-b-gray-200">
                            <div className="flex flex-col w-full justify-items-start">
                                <div className="flex flex-row">
                                    <input className="text-xs border rounded-l-md py-1 px-3 w-5/6" type="text" placeholder="Add number of person" onChange={this.handleInputChangePhoneNum} value={this.state.phone} />
                                    <button className="text-xs bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded-r-md w-1/6" onClick={this.handleSubmitPhone}>\/</button>
                                </div>
                                <p className="text-xs text-gray-400 mt-1 inline-flex px-3" >For example: 79290421312</p>
                            </div>
                        </div>
                        {this.state.phones
                        .slice()
                        .reverse()
                        .map(phoneI => (
                            <div className={`p-4 rounded-md border-b border-b-gray-200 ${this.state.nowPhoneId === phoneI.id ? 'bg-green-100' : 'bg-white'}`}>
                                <div className='cursor-pointer flex flex-wrap items-start justify-center' onClick={() => {this.handleClickPhone(phoneI)}}>
                                    <div className="mr-auto flex flex-col justify-start">
                                        <div className="text-gray-400 text-xs mb-2 inline-flex">
                                            <p>Click here to chat</p>
                                        </div>
                                        <div className="text-gray-600 text-xs inline-flex">
                                            <p>tel.: {phoneI.content}</p>
                                        </div>
                                    </div>
                                    <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 float-right rounded" onClick={() => {this.handleDeletePhone(phoneI.id)}}>X</button>
                                </div>
                            </div>
                        ))}

                    </div>
                    <div className="chat w-3/4 flex items-end flex-col h-full justify-end">
                        <div className='parent-container w-full flex items-end flex-col overflow-y-auto'>
                            <ul className="dialog-items p-4 w-full content flex-grow">
                            {this.state.messages
                                .map((message, index) => (
                                message.type === 'out' ? (
                                    <li
                                    className={`dialog-item flex bg-white rounded-md w-2/3 shadow-md flex-wrap p-3 mt-1`}
                                    key={index}
                                    >
                                        <p className='mr-2 text-xs text-gray-400'>{message.type}</p>
                                        {message.text}
                                        <button className="bg-green-500 hover:bg-green-700 text-white py-1 px-2 float-right rounded ml-auto" onClick={() => {this.handleDeleteMessage(index)}}>X</button>
                                    </li>
                                ) : (
                                    <li
                                    className={`dialog-item flex bg-white rounded-md w-2/3 shadow-md flex-wrap p-3 ml-auto mt-1`}
                                    key={index}
                                    >
                                        <button className="bg-green-500 hover:bg-green-700 text-white py-1 px-2 float-left rounded mr-auto" onClick={() => {this.handleDeleteMessage(index)}}>X</button>
                                        {message.text}
                                        <p className='ml-2 text-xs text-gray-400'>{message.type}</p>
                                    </li>
                                )
                                ))}
                            </ul>
                        </div>
                        <div className="flex flex-wrap input-area bg-gray-100 shadow-md bg-white w-full p-3">
                            <input
                                type="text"
                                className="input-message border rounded-l-md py-2 px-4 w-4/5 h-full"
                                placeholder="Write message"
                                maxLength="1000"
                                value={this.state.text}
                                onChange={this.handleInputChangeText}
                            />
                            <button
                                className={`button-submit bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 w-1/5 rounded-r-md`}
                                onClick={this.handleSendMessage}
                            >Send</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default connect(mapStateToProps)(ChatPage);