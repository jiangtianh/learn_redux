import { configureStore } from "@reduxjs/toolkit";
import postsReducer from "../features/posts/postsSlice";
import { PostsState } from "../features/posts/postsSlice";
import usersReducer from "../features/users/usersSlice";
import { UsersState } from "../features/users/usersSlice";



const store = configureStore({
    reducer: {
        posts: postsReducer,
        users: usersReducer
    }
})

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export default store;