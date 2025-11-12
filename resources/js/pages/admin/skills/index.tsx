import { Head, Link } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Search, Trash2, Award, Eye } from 'lucide-react';
import axios from 'axios';
import { dashboard } from '@/routes';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Skills',
        href: '/admin/skills',
    },
];

interface Skill {
    id: number;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

interface PaginationMeta {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

export default function SkillsIndex() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState<PaginationMeta>({
        current_page: 1,
        per_page: 50,
        total: 0,
        last_page: 1,
    });

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

    const fetchSkills = useCallback(async (page = 1, searchQuery = '') => {
        setLoading(true);
        try {
            const response = await axios.get('/admin/api/skills', {
                params: {
                    page,
                    per_page: 50,
                    search: searchQuery || undefined,
                },
            });

            setSkills(response.data.data);
            setPagination(response.data.meta.pagination);
        } catch (error) {
            console.error('Failed to fetch skills:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSkills(1, search);
    }, []);

    const handleSearch = () => {
        fetchSkills(1, search);
    };

    const handleSearchKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleCreateSkill = async () => {
        setFormErrors({});
        try {
            await axios.post('/admin/api/skills', formData);
            setIsCreateDialogOpen(false);
            setFormData({ name: '', description: '' });
            fetchSkills(pagination.current_page, search);
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setFormErrors(error.response.data.errors);
            }
        }
    };

    const handleEditSkill = async () => {
        if (!selectedSkill) return;

        setFormErrors({});
        try {
            await axios.put(`/admin/api/skills/${selectedSkill.id}`, formData);
            setIsEditDialogOpen(false);
            setSelectedSkill(null);
            setFormData({ name: '', description: '' });
            fetchSkills(pagination.current_page, search);
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setFormErrors(error.response.data.errors);
            }
        }
    };

    const handleDeleteSkill = async () => {
        if (!selectedSkill) return;

        try {
            await axios.delete(`/admin/api/skills/${selectedSkill.id}`);
            setIsDeleteDialogOpen(false);
            setSelectedSkill(null);
            fetchSkills(pagination.current_page, search);
        } catch (error) {
            console.error('Failed to delete skill:', error);
        }
    };

    const openCreateDialog = () => {
        setFormData({ name: '', description: '' });
        setFormErrors({});
        setIsCreateDialogOpen(true);
    };

    const openEditDialog = (skill: Skill) => {
        setSelectedSkill(skill);
        setFormData({
            name: skill.name,
            description: skill.description || '',
        });
        setFormErrors({});
        setIsEditDialogOpen(true);
    };

    const openDeleteDialog = (skill: Skill) => {
        setSelectedSkill(skill);
        setIsDeleteDialogOpen(true);
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Skills Management" />

            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Skills</h1>
                        <p className="text-muted-foreground mt-2">Manage skills and competencies</p>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Award className="mr-2 h-4 w-4" />
                        Add Skill
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Skills</CardTitle>
                        <CardDescription>
                            {pagination.total} total skill{pagination.total !== 1 ? 's' : ''}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or description..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyPress={handleSearchKeyPress}
                                    className="pl-9"
                                />
                            </div>
                            <Button onClick={handleSearch} variant="secondary">
                                Search
                            </Button>
                        </div>

                        {loading ? (
                            <div className="text-center py-8 text-muted-foreground">Loading skills...</div>
                        ) : skills.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">No skills found</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {skills.map((skill) => (
                                        <TableRow key={skill.id}>
                                            <TableCell className="font-medium">{skill.name}</TableCell>
                                            <TableCell>
                                                {skill.description ? (
                                                    <span className="text-sm text-muted-foreground">
                                                        {skill.description}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground italic">
                                                        No description
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/admin/skills/${skill.id}`}>
                                                        <Button variant="ghost" size="sm" title="View Profile">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openEditDialog(skill)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openDeleteDialog(skill)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}

                        {pagination.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Page {pagination.current_page} of {pagination.last_page}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={pagination.current_page === 1}
                                        onClick={() => fetchSkills(pagination.current_page - 1, search)}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={pagination.current_page === pagination.last_page}
                                        onClick={() => fetchSkills(pagination.current_page + 1, search)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create Skill Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Skill</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="create-name">Name</Label>
                            <Input
                                id="create-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter skill name"
                            />
                            {formErrors.name && (
                                <p className="text-sm text-destructive">{formErrors.name[0]}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-description">Description</Label>
                            <Input
                                id="create-description"
                                value={formData.description}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                placeholder="Enter skill description (optional)"
                            />
                            {formErrors.description && (
                                <p className="text-sm text-destructive">{formErrors.description[0]}</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateSkill}>Create Skill</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Skill Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Skill</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter skill name"
                            />
                            {formErrors.name && (
                                <p className="text-sm text-destructive">{formErrors.name[0]}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Input
                                id="edit-description"
                                value={formData.description}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                placeholder="Enter skill description (optional)"
                            />
                            {formErrors.description && (
                                <p className="text-sm text-destructive">{formErrors.description[0]}</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleEditSkill}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Skill Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Skill</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-muted-foreground">
                            Are you sure you want to delete <strong>{selectedSkill?.name}</strong>? This action cannot
                            be undone and will remove this skill from all users.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteSkill}>
                            Delete Skill
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
