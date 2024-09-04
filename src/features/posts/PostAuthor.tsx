import { useSelector } from "react-redux";
import { RootState } from "../../app/store";

const PostAuthor = ({ userId }: { userId: number }) => {
    const users = useSelector((state: RootState) => state.users);

    const author = users.find(user => user.id === userId);

    return <span>by {author ? author.name: "Unknown author"}</span>
}
export default PostAuthor;