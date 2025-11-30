import React, { useState } from 'react';
import AdminSidebarLayout from '@/layouts/admin/admin-sidebar-layout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Trash2, Edit, RefreshCw, FlaskConical } from 'lucide-react';

// @ts-ignore
declare const route: any;

interface Article {
    id: number;
    title: string;
    content: string;
    status: 'draft' | 'published' | 'archived';
    tags: string[];
    author: {
        id: number;
        name: string;
    };
    published_at: string;
    created_at: string;
    has_embedding: boolean;
}

interface Props {
    articles: {
        data: Article[];
        links: any[];
        meta: any;
    };
    filters: {
        search?: string;
    };
}

export default function KbIndex({ articles, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);
    const [isTestSearchOpen, setIsTestSearchOpen] = useState(false);

    // Search handler
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin.kb.index'),
            { search },
            { preserveState: true }
        );
    };

    // Form for Create/Edit
    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: '',
        content: '',
        status: 'draft',
        tags: [] as string[],
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.kb.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
            },
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingArticle) return;

        put(route('admin.kb.update', editingArticle.id), {
            onSuccess: () => {
                setEditingArticle(null);
                reset();
            },
        });
    };

    const handleDelete = (article: Article) => {
        if (confirm('Are you sure you want to delete this article?')) {
            router.delete(route('admin.kb.destroy', article.id));
        }
    };

    const handleReindex = (article: Article) => {
        router.post(route('admin.kb.reindex', article.id));
    };

    const openEdit = (article: Article) => {
        setEditingArticle(article);
        setData({
            title: article.title,
            content: article.content,
            status: article.status,
            tags: article.tags,
        });
    };

    // Test Search Component
    const TestSearchDialog = () => {
        const [query, setQuery] = useState('');
        const [results, setResults] = useState<any[]>([]);
        const [loading, setLoading] = useState(false);

        const runSearch = async (e: React.FormEvent) => {
            e.preventDefault();
            setLoading(true);
            try {
                // @ts-ignore
                const res = await window.axios.post(route('admin.kb.search'), { query });
                setResults(res.data.results);
            } catch (err) {
                console.error(err);
                alert('Search failed');
            } finally {
                setLoading(false);
            }
        };

        return (
            <Dialog open={isTestSearchOpen} onOpenChange={setIsTestSearchOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Test Knowledge Base Search</DialogTitle>
                        <DialogDescription>
                            Simulate how the Agent retrieves articles using vector search.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={runSearch} className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter a user query (e.g. 'How do I get a refund?')"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Searching...' : 'Search'}
                            </Button>
                        </div>
                    </form>
                    <div className="max-h-[400px] overflow-y-auto space-y-4 mt-4">
                        {results.map((article, i) => (
                            <div key={i} className="p-4 border rounded bg-muted/50">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold">{article.title}</h4>
                                    <Badge variant="secondary">
                                        Score: {(article.similarity_score * 100).toFixed(1)}%
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {article.content}
                                </p>
                            </div>
                        ))}
                        {results.length === 0 && query && !loading && (
                            <p className="text-center text-muted-foreground">No relevant articles found.</p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        );
    };

    return (
        <AdminSidebarLayout>
            <Head title="Knowledge Base" />
            
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Knowledge Base</h2>
                        <p className="text-muted-foreground">
                            Manage articles used by the AI Agent for grounding.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsTestSearchOpen(true)}>
                            <FlaskConical className="w-4 h-4 mr-2" />
                            Test Search
                        </Button>
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={() => reset()}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Article
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                                <form onSubmit={handleCreate}>
                                    <DialogHeader>
                                        <DialogTitle>Create Article</DialogTitle>
                                        <DialogDescription>
                                            Add a new article to the knowledge base.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="title">Title</Label>
                                            <Input
                                                id="title"
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                required
                                            />
                                            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="status">Status</Label>
                                            <Select
                                                value={data.status}
                                                onValueChange={(val) => setData('status', val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="draft">Draft</SelectItem>
                                                    <SelectItem value="published">Published</SelectItem>
                                                    <SelectItem value="archived">Archived</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="content">Content (Markdown)</Label>
                                            <Textarea
                                                id="content"
                                                className="h-40 font-mono text-sm"
                                                value={data.content}
                                                onChange={(e) => setData('content', e.target.value)}
                                                required
                                            />
                                            {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={processing}>
                                            Create Article
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <form onSubmit={handleSearch}>
                            <Input
                                placeholder="Search articles..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </form>
                    </div>
                </div>

                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Embedding</TableHead>
                                <TableHead>Last Updated</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {articles.data.map((article) => (
                                <TableRow key={article.id}>
                                    <TableCell className="font-medium">
                                        {article.title}
                                        <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                            {article.content.substring(0, 60)}...
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                                            {article.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {article.has_embedding ? (
                                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                                Indexed
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
                                                Pending
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(article.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleReindex(article)}
                                            title="Re-index"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEdit(article)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(article)}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editingArticle} onOpenChange={(open) => !open && setEditingArticle(null)}>
                <DialogContent className="sm:max-w-[600px]">
                    <form onSubmit={handleUpdate}>
                        <DialogHeader>
                            <DialogTitle>Edit Article</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-title">Title</Label>
                                <Input
                                    id="edit-title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-status">Status</Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(val) => setData('status', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-content">Content</Label>
                                <Textarea
                                    id="edit-content"
                                    className="h-40 font-mono text-sm"
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={processing}>
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            
            <TestSearchDialog />
        </AdminSidebarLayout>
    );
}
