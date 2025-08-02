import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, MessageCircle, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface TokenCommentsProps {
  tokenId: string;
}

const COMMENTS = [
  {
    id: 1,
    user: {
      name: 'Ahmet Y.',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop',
    },
    content: 'Bu token gerçekten büyük potansiyele sahip! Topluluk çok aktif ve geliştirici ekip sürekli yeni özellikler ekliyor.',
    timestamp: '2 saat önce',
    likes: 24,
    replies: 3,
    isLiked: true,
  },
  {
    id: 2,
    user: {
      name: 'Mehmet K.',
      avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=50&h=50&fit=crop',
    },
    content: 'Yol haritası çok etkileyici. Özellikle NFT entegrasyonu planları heyecan verici.',
    timestamp: '5 saat önce',
    likes: 18,
    replies: 1,
    isLiked: false,
  },
  {
    id: 3,
    user: {
      name: 'Ayşe D.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop',
    },
    content: 'Likidite kilidi ve güvenlik önlemleri gayet iyi düşünülmüş. Güvenle yatırım yapılabilir.',
    timestamp: '1 gün önce',
    likes: 42,
    replies: 7,
    isLiked: false,
  },
];

export function TokenComments({ tokenId }: TokenCommentsProps) {
  const [comments, setComments] = useState(COMMENTS);
  const [newComment, setNewComment] = useState('');

  const handleLike = (commentId: number) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
          isLiked: !comment.isLiked,
        };
      }
      return comment;
    }));
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: comments.length + 1,
      user: {
        name: 'Sen',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop',
      },
      content: newComment,
      timestamp: 'Şimdi',
      likes: 0,
      replies: 0,
      isLiked: false,
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-[#F7E436] p-6 rounded-3xl">
        <Textarea
          placeholder="Yorumunuzu yazın..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[100px] bg-black/10 border-0 rounded-2xl text-black placeholder:text-black/40 focus-visible:ring-0 focus-visible:ring-offset-0 mb-4"
        />
        <div className="flex justify-end">
          <Button 
            onClick={handleSubmitComment}
            disabled={!newComment.trim()}
            className="bg-black text-white rounded-full px-8 hover:bg-black/90"
          >
            Yorum Yap
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment.id} className="border-0 bg-[#F7E436] p-6 rounded-3xl">
            <div className="flex gap-4">
              <Avatar className="h-12 w-12 border-2 border-black/10">
                <AvatarImage src={comment.user.avatar} />
                <AvatarFallback className="bg-black/10 text-black">
                  {comment.user.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-black">{comment.user.name}</span>
                    <span className="text-sm text-black/60">{comment.timestamp}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-black/60 hover:text-black hover:bg-black/10">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#F7E436] border-0">
                      <DropdownMenuItem className="text-black/60 focus:text-black focus:bg-black/10">
                        Bildir
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-black/10">
                        Engelle
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-black/80">{comment.content}</p>
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "gap-2 text-black/60 hover:text-black hover:bg-black/10 rounded-full",
                      comment.isLiked && "text-black bg-black/10"
                    )}
                    onClick={() => handleLike(comment.id)}
                  >
                    <ThumbsUp className={cn(
                      "h-4 w-4",
                      comment.isLiked && "fill-current"
                    )} />
                    {comment.likes}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 text-black/60 hover:text-black hover:bg-black/10 rounded-full"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {comment.replies}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}