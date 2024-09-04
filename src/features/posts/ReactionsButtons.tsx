import { useDispatch } from "react-redux";
import { reactionAdded } from "./postsSlice";
import { Post, Reaction } from "./postsSlice";

const reactionEmoji = {
    thumbsUp: '👍',
    wow: '😮',
    heart: '❤️',
    rocket: '🚀',
    coffee: '☕'
}

const ReactionButtons = ({ post }: { post: Post}) => {
    const dispatch = useDispatch();

    const reactionButtons = Object.entries(reactionEmoji).map(([name, emoji]) => {
        return (
            <button 
                key={name}
                type="button"
                className="reactionButton"
                onClick={() => {
                    dispatch(reactionAdded({ postId: post.id, reaction: name as keyof Reaction }))
                }}
            >
                {emoji} {post.reactions[name as keyof Reaction]}
            </button>
        )
    })

    return (
        <div>
            {reactionButtons}
        </div>
    )
}
export default ReactionButtons;