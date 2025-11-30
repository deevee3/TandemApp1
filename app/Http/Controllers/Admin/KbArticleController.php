<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\KbArticleResource;
use App\Models\KbArticle;
use App\Services\KnowledgeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class KbArticleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = KbArticle::query()
            ->with('author')
            ->latest();

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('title', 'like', "%{$search}%")
                ->orWhere('content', 'like', "%{$search}%");
        }

        $articles = $query->paginate(10)->withQueryString();

        return Inertia::render('admin/kb/index', [
            'articles' => KbArticleResource::collection($articles),
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'status' => 'required|in:draft,published,archived',
            'tags' => 'nullable|array',
        ]);

        $validated['author_id'] = $request->user()->id;
        $validated['published_at'] = $validated['status'] === 'published' ? now() : null;

        KbArticle::create($validated);

        return Redirect::route('admin.kb.index')->with('success', 'Article created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, KbArticle $kb_article)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'status' => 'required|in:draft,published,archived',
            'tags' => 'nullable|array',
        ]);

        if ($validated['status'] === 'published' && $kb_article->status !== 'published') {
            $validated['published_at'] = now();
        }

        $kb_article->update($validated);

        return Redirect::route('admin.kb.index')->with('success', 'Article updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(KbArticle $kb_article)
    {
        $kb_article->delete();

        return Redirect::route('admin.kb.index')->with('success', 'Article deleted successfully.');
    }

    /**
     * Manually re-index an article.
     */
    public function reindex(KbArticle $kb_article)
    {
        \App\Jobs\GenerateArticleEmbedding::dispatchSync($kb_article);

        return back()->with('success', 'Article re-indexed successfully.');
    }

    /**
     * Test the search functionality.
     */
    public function search(Request $request, KnowledgeService $knowledgeService)
    {
        $validated = $request->validate([
            'query' => 'required|string|min:3',
        ]);

        $results = $knowledgeService->search($validated['query'], 5);

        return response()->json([
            'results' => $results,
        ]);
    }
}
