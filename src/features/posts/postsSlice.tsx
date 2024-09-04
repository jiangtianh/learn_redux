import { createSlice, PayloadAction, createAsyncThunk, createSelector, createEntityAdapter, EntityState, EntityId } from "@reduxjs/toolkit";
import { sub } from "date-fns";
import axios from "axios";
import { RootState } from "../../app/store";

const POSTS_URL = 'https://jsonplaceholder.typicode.com/posts';

export type Reaction = {
    thumbsUp: number;
    hooray: number;
    heart: number;
    rocket: number;
    eyes: number;
}

export type Post = {
    id: number;
    title: string;
    body: string;
    userId: number;
    date: string;
    reactions: Reaction;
}

// Define the state interface using EntityState
export interface PostsState extends EntityState<Post, number> {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null | undefined;
    count: number;
}

const postsAdapter = createEntityAdapter({
    selectId: (post: Post) => post.id,
    sortComparer: (a, b) => b.date.localeCompare(a.date)
})


const initialState = postsAdapter.getInitialState({
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null as string | null | undefined,
    count: 0
})

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
    const response = await axios.get(POSTS_URL);
    return response.data;
})

export const addNewPost = createAsyncThunk('posts/addNewPost', async (initialPost: { title: string, body: string, userId: string }) => {
    const response = await axios.post(POSTS_URL, initialPost);
    return response.data;
})

export const updatePost = createAsyncThunk('posts/updatePost', async (initialPost: { id: number, title: string, body: string, userId: number, reactions: Reaction }) => {
    const { id } = initialPost;
    try {
        const response = await axios.put(`${POSTS_URL}/${id}`, initialPost)
        return response.data
    } catch (err) {
        return initialPost;
    }
})

export const deletePost = createAsyncThunk('posts/deletePost', async(initialPost: { id: number }) => {
    const { id } = initialPost;
    try {
        const response = await axios.delete(`${POSTS_URL}/${id}`)
        if (response?.status === 200) return initialPost;
    } catch (err: any) {
        return err.message;
    }
})

const postSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        reactionAdded(state, action: PayloadAction<{ postId: number, reaction: keyof Reaction }>) {
            const { postId, reaction } = action.payload;
            const existingPost = state.entities[postId];
            if (existingPost && existingPost.reactions[reaction] !== undefined) {
                existingPost.reactions[reaction]++;
            }
        }, 
        increaseCount(state) {
            state.count += 1
        }
    },
    extraReducers(builder) {
        builder
            .addCase(fetchPosts.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(fetchPosts.fulfilled, (state, action) => {
                state.status = 'succeeded'
                // Adding date and reactions
                let min = 1;

                const loadedPosts = action.payload.map((post: Post) => {
                    post.date = sub(new Date(), { minutes: min++ }).toISOString();
                    post.reactions = {
                        thumbsUp: 0,
                        hooray: 0,
                        heart: 0,
                        eyes: 0,
                        rocket: 0
                    }
                    return post;
                });
                // Add any fetched posts to the array
                postsAdapter.upsertMany(state, loadedPosts)
            })
            .addCase(fetchPosts.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })
            .addCase(addNewPost.fulfilled, (state, action) => {
                action.payload.userId = Number(action.payload.userId);
                action.payload.date = new Date().toISOString();
                action.payload.reactions = {
                    thumbsUp: 0,
                    wow: 0,
                    heart: 0,
                    coffee: 0,
                    rocket: 0
                }
                console.log(action.payload);
                postsAdapter.addOne(state, action.payload);
            })
            .addCase(updatePost.fulfilled, (state, action) => {
                if (!action.payload?.id) {
                    console.log('Update could not complete')
                    console.log(action.payload)
                    return;
                }
                action.payload.date = new Date().toISOString();
                postsAdapter.upsertOne(state, action.payload);
            })
            .addCase(deletePost.fulfilled, (state, action) => {
                if (!action.payload?.id) {
                    console.log('Delete could not complete')
                    console.log(action.payload)
                    return;
                }
                postsAdapter.removeOne(state, action.payload.id)
            })
    }
})

export const getPostsStatus = (state: RootState) => state.posts.status;
export const getPostsError = (state: { posts: { error: string | null | undefined } }) => state.posts.error;
export const getPostCount = (state: { posts: { count: number }}) => state.posts.count;


//getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
    selectAll: selectAllPosts,
    selectById: selectPostById,
    selectIds: selectPostIds
    // Pass in a selector that returns the posts slice of state
} = postsAdapter.getSelectors((state: RootState) => state.posts)

export const selectPostsByUser = createSelector(
    [selectAllPosts, (state, userId) => userId],
    (posts, userId) => posts.filter(post => post.userId === userId)
)



export const { reactionAdded, increaseCount } = postSlice.actions;
export default postSlice.reducer; 