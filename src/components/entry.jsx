import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { setUser } from '../store/slices/userSlice'
import { getStateInstance } from "../utils/greenAPI";



class Entry extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          id: '',
          token: '',
          errors: {},
        };
      }

    handleSubmit = async (event) => {
        event.preventDefault();
        let errors = {};
        const { dispatch } = this.props;

        //Redux
        dispatch(setUser({
            id: this.state.id,
            token: this.state.token
        }));

        try {
            const response = await getStateInstance("getStateInstance", this.state.id, this.state.token);
            if (response.stateInstance === "authorized") {
                const link = document.querySelector('#toAdmin');
                if (link) {
                    link.click();
                }
            } else {
                errors.email = 'Вы не авторизованы.';
                this.setState({ errors });
            }
        } catch (error) {
            console.error("Ошибка при выполнении функции getStateInstance:", error);
            errors.email = 'Неправильный ID или Token или возможны проблемы с авторизацией.';
            this.setState({ errors });
        }
    }

    render() {
        const { id, token, errors } = this.state;
        return (
            <div className="p-4 bg-green-50 flex flex-wrap items-center justify-center w-screen h-screen">
                <div className="flex flex-col mr-4">
                <input
                    className="border rounded-md py-2 px-4 mb-2 w-64"
                    type="text"
                    placeholder="Enter id"
                    value={id}
                    onChange={(event) => this.setState({ id: event.target.value })}
                />
                <input
                    className="border rounded-md py-2 px-4 mb-4 w-64"
                    type="password"
                    placeholder="Enter token"
                    value={token}
                    onChange={(event) => this.setState({ token: event.target.value })}
                />
                {(errors.auth) && <div className="text-red-500 mb-4">{errors.auth}</div>}
                <button
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 mb-1 rounded"
                    onClick={this.handleSubmit}
                >
                    Come in
                </button>
                <Link className="hidden" id="toAdmin" to="/react_whatup_clone_greenapi/chat">В админку</Link>
                </div>
            </div>
        ) 
    }
}

export default connect()(Entry);