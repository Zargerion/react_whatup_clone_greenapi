import {createSlice} from '@reduxjs/toolkit'

const initialState = {
    token: null,
    id: null,
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser(state, action) {
            state.token = action.payload.token;
            state.id = action.payload.id;
        },
        removeUser(state) {
            state.token = null;
            state.id = null;    
        },
    }, 
});

export const {setUser, removeUser} = userSlice.actions;
export default userSlice.reducer;