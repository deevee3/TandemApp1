import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Award, Users, DollarSign, Calendar, Code } from 'lucide-react';
import { dashboard } from '@/routes';
import admin from '@/routes/admin';

interface Skill {
    id: number;
    code?: string;
    name: string;
    description?: string;
    avatar?: string;
    hourly_rate?: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    skill: Skill;
}

export default function SkillShow({ skill }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Admin',
            href: admin.dashboard().url,
        },
        {
            title: 'Skills',
            href: admin.skills.index().url,
        },
        {
            title: skill.name,
            href: `/admin/skills/${skill.id}`,
        },
    ];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`${skill.name} - Skill Profile`} />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={admin.skills.index().url}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Skill Profile</h1>
                            <p className="text-muted-foreground mt-2">View skill details and information</p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Profile Card */}
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4">
                            <Avatar className="h-32 w-32">
                                <AvatarImage src={skill.avatar} alt={skill.name} />
                                <AvatarFallback className="text-2xl bg-primary/10">
                                    <Award className="h-12 w-12 text-primary" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-center space-y-2 w-full">
                                <h2 className="text-2xl font-bold">{skill.name}</h2>
                                {skill.code && (
                                    <div className="flex items-center justify-center gap-2 pt-2">
                                        <Code className="h-3 w-3 text-muted-foreground" />
                                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                                            {skill.code}
                                        </code>
                                    </div>
                                )}
                                {skill.hourly_rate && (
                                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                        <DollarSign className="h-4 w-4" />
                                        <span className="text-sm font-medium">
                                            ${skill.hourly_rate.toFixed(2)}/hour
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Details Card */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                            <CardDescription>Skill information and metadata</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Description */}
                            {skill.description && (
                                <div>
                                    <h3 className="font-semibold mb-2">Description</h3>
                                    <p className="text-sm text-muted-foreground">{skill.description}</p>
                                </div>
                            )}

                            {/* Technical Details */}
                            <div>
                                <h3 className="font-semibold mb-3">Technical Details</h3>
                                <div className="grid gap-2 text-sm">
                                    {skill.code && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Code:</span>
                                            <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                                                {skill.code}
                                            </code>
                                        </div>
                                    )}
                                    {skill.hourly_rate && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Billing Rate:</span>
                                            <span className="font-medium">${skill.hourly_rate.toFixed(2)}/hour</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Account Information */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <h3 className="font-semibold">Timestamps</h3>
                                </div>
                                <div className="grid gap-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Created:</span>
                                        <span>{formatDate(skill.created_at)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Last Updated:</span>
                                        <span>{formatDate(skill.updated_at)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
