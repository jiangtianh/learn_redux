import { useId, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectPostById, updatePost, deletePost } from "./postsSlice";
import { useParams, useNavigate } from "react-router-dom";

import { selectAllUsers } from "../users/usersSlice";
import { AppDispatch, RootState } from "../../app/store";

const EditPostForm = () => {
    const { postId } = useParams()
    const navigate = useNavigate()

    const post = useSelector((state: RootState) => selectPostById(state, Number(postId)))
    const users = useSelector(selectAllUsers)

    const [title, setTitle] = useState(post?.title || "")
    const [content, setContent] = useState(post?.body || "")
    const [userId, setUserId] = useState(post?.userId || -1)
    const [requestStatus, setRequestStatus] = useState('idle')

    const dispatch = useDispatch<AppDispatch>()

    if (!post) {
        return (
            <section>
                <h2>Post not found!</h2>
            </section>
        )
    }
    

    const onTitleChanged = (e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)
    const onContentChanged = (e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)
    const onAuthorChanged = (e: React.ChangeEvent<HTMLSelectElement>) => setUserId(Number(e.target.value))

    const canSave = [title, content, userId].every(Boolean) && requestStatus === 'idle';

    const onSavePostClicked = () => {
        if (canSave) {
            try {
                setRequestStatus('pending')
                dispatch(updatePost({ id: post.id, title, body: content, userId, reactions: post.reactions})).unwrap()

                setTitle('')
                setContent('')
                setUserId(-1)
                navigate(`/post/${postId}`)
            } catch (err) {
                console.log('Failed to save the post', err)
            } finally {
                setRequestStatus('idle')
            }
        }
    }
    const onDeletePostClicked = () => {
        try {
            setRequestStatus('pending')
            dispatch(deletePost({id: post.id})).unwrap()

            setTitle('')
            setContent('')
            setUserId(-1)
            navigate('/')

        } catch (err: any) {
            console.error('Failed to delete the post', err)
        } finally {
            setRequestStatus('idle')
        }
    }

    const usersOptions = users.map(user => 
        <option
            key={user.id}
            value={user.id}
        >{user.name}</option>
    )

    return (
        <section>
            <h2>Edit Post</h2>
            <form>
                <label htmlFor="postTitle">Post Title:</label>
                <input
                    type="text"
                    id="postTitle"
                    name="postTitle"
                    value={title}
                    onChange={onTitleChanged}
                />
                <label htmlFor="postAuthor">Author:</label>
                <select id="postAuthor" defaultValue={userId} onChange={onAuthorChanged}>
                    <option value={undefined}></option>
                    {usersOptions}
                </select>
                <label htmlFor="postContent">Content:</label>
                <textarea
                    id="postContent"
                    name="postContent"
                    value={content}
                    onChange={onContentChanged}
                />
                <button
                    type="button"
                    onClick={onSavePostClicked}
                    disabled={!canSave}
                >Save Post</button>
                <button className="deleteButton"
                    type="button"
                    onClick={onDeletePostClicked}
                >Delete Post</button>
            </form>
        </section>
    )

}

export default EditPostForm;