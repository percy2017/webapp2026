<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSiteMenuItemRequest;
use App\Http\Requests\Admin\UpdateSiteMenuItemRequest;
use App\Models\SiteMenuItem;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SiteMenuController extends Controller
{
    public function index(): Response
    {
        $items = SiteMenuItem::query()
            ->with('children')
            ->orderBy('location')
            ->orderBy('sort')
            ->orderBy('id')
            ->get();

        return Inertia::render('site-menu/index', [
            'items' => $items,
            'parentOptions' => $items
                ->whereNull('parent_id')
                ->values()
                ->map(fn (SiteMenuItem $item) => [
                    'id' => $item->id,
                    'label' => $item->label,
                ])
                ->all(),
        ]);
    }

    public function store(StoreSiteMenuItemRequest $request): RedirectResponse
    {
        $item = SiteMenuItem::create($request->validated());

        return back()->with('success', "Ítem «{$item->label}» creado.");
    }

    public function update(
        UpdateSiteMenuItemRequest $request,
        SiteMenuItem $siteMenuItem,
    ): RedirectResponse {
        $siteMenuItem->update($request->validated());

        return back()->with(
            'success',
            "Ítem «{$siteMenuItem->label}» actualizado.",
        );
    }

    public function destroy(SiteMenuItem $siteMenuItem): RedirectResponse
    {
        $siteMenuItem->delete();

        return back()->with('success', 'Ítem eliminado.');
    }

    public function moveUp(SiteMenuItem $siteMenuItem): RedirectResponse
    {
        $siblings = $this->siblingsQuery($siteMenuItem)
            ->where('sort', '<', $siteMenuItem->sort)
            ->orderByDesc('sort')
            ->first();

        if (! $siblings) {
            return back();
        }

        $currentSort = $siteMenuItem->sort;
        $siteMenuItem->update(['sort' => $siblings->sort]);
        $siblings->update(['sort' => $currentSort]);

        return back();
    }

    public function moveDown(SiteMenuItem $siteMenuItem): RedirectResponse
    {
        $siblings = $this->siblingsQuery($siteMenuItem)
            ->where('sort', '>', $siteMenuItem->sort)
            ->orderBy('sort')
            ->first();

        if (! $siblings) {
            return back();
        }

        $currentSort = $siteMenuItem->sort;
        $siteMenuItem->update(['sort' => $siblings->sort]);
        $siblings->update(['sort' => $currentSort]);

        return back();
    }

    private function siblingsQuery(SiteMenuItem $item)
    {
        return SiteMenuItem::query()
            ->where('location', $item->location)
            ->where('parent_id', $item->parent_id);
    }
}
