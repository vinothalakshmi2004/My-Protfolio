/**
 * DataTable — responsive, optionally drag-sortable list of records.
 *
 * One DOM structure, two layouts (pure CSS, so drag-and-drop works in both):
 *  - Mobile (< md): every row is a stacked CARD: [handle] [content] [actions], with each
 *    secondary column shown as "Label: value" under the title.
 *  - md+: a real TABLE grid. Each row is a CSS grid using `--cols`; the content wrapper
 *    uses `md:contents` so its cells become columns of that grid.
 *
 *  - xl+ (≥1280px): columns marked `wideOnly` are added. Between md and xl the content area
 *    is only ~700px wide (the fixed sidebar takes 256px at lg), so secondary columns
 *    (e.g. Featured, Status) are left out there to keep titles readable.
 *
 *  columns: [{ key, header, render(item), width?: '10rem' | 'minmax(0,2fr)', primary?: true,
 *              hideOnMobile?: true (not on cards), wideOnly?: true (tables only from xl+), align? }]
 *  sortable + onReorder(newItems): enables drag handles (disable while filtered with reorderDisabled)
 *  actions(item): row buttons (edit / toggle / delete)
 */
import { SortableList, DragHandle } from './SortableList';
import { EmptyState, SkeletonList } from './Feedback';

export const DataTable = ({
  items,
  columns,
  getId = (item) => item._id,
  sortable = false,
  reorderDisabled = false,
  onReorder,
  actions,
  loading = false,
  empty,
  rowClassName,
  caption,
}) => {
  // Grid templates: md–xl uses the compact column set, xl+ adds `wideOnly` columns
  const buildTemplate = (cols) =>
    [sortable ? 'auto' : null, ...cols.map((c) => c.width || 'minmax(0,1fr)'), actions ? 'auto' : null].filter(Boolean).join(' ');
  const template = buildTemplate(columns.filter((c) => !c.wideOnly));
  const templateXl = buildTemplate(columns);
  const gridVars = { '--cols': template, '--cols-xl': templateXl };
  const gridClass = 'md:[grid-template-columns:var(--cols)] xl:[grid-template-columns:var(--cols-xl)]';

  /**
   * Explicit display class for each layout (never two conflicting classes at one breakpoint):
   *  mobile card: hidden | flex label/value row | block (primary)
   *  md–xl table: hidden for wideOnly, otherwise block
   *  xl+ table:   block
   */
  const cellClass = (col) => {
    const mobile = col.hideOnMobile ? 'hidden' : col.primary ? 'block' : 'flex items-center gap-2';
    const md = col.wideOnly ? 'md:hidden' : 'md:block';
    return `${mobile} ${md} xl:block`;
  };

  if (loading) return <SkeletonList />;
  if (!items.length) return empty || <EmptyState title="Nothing here yet" />;

  const renderRow = (item, index, handle) => (
    <div
      role="row"
      style={gridVars}
      // Mobile: card grid [handle | content | actions]; md+: table row using the shared --cols templates
      className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-2 gap-y-1 bg-white px-2 py-3 dark:bg-slate-900 sm:px-3 md:items-center md:gap-x-4 md:px-4 ${gridClass} ${
        sortable ? '' : 'pl-4 md:pl-4'
      } ${rowClassName?.(item) || ''}`}
    >
      {sortable ? <DragHandle handle={handle} disabled={reorderDisabled} /> : <span className="md:hidden" />}

      {/* Cards stack their cells on mobile; on md+ `contents` flattens them into table columns */}
      <div className="flex min-w-0 flex-col gap-1.5 md:contents">
        {columns.map((col) => (
          <div
            key={col.key}
            role="cell"
            className={`min-w-0 ${cellClass(col)} ${col.primary ? '' : 'text-sm text-slate-600 dark:text-slate-300 md:truncate'} ${
              col.align === 'right' ? 'md:text-right' : ''
            }`}
          >
            {!col.primary && (
              <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-slate-400 md:hidden">{col.header}:</span>
            )}
            {col.render ? col.render(item, index) : item[col.key]}
          </div>
        ))}
      </div>

      {actions && (
        // Actions: vertical stack on mobile cards; inline row on md+
        <div role="cell" className="flex flex-col items-end gap-1 md:flex-row md:items-center md:justify-end">
          {actions(item, index)}
        </div>
      )}
    </div>
  );

  return (
    <div role="table" aria-label={caption} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Column headers only exist on md+ (cards are self-labelled on mobile) */}
      <div
        role="row"
        style={gridVars}
        className={`hidden border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400 md:grid md:items-center md:gap-x-4 ${gridClass}`}
      >
        {sortable && <span className="w-9" aria-hidden="true" />}
        {columns.map((col) => (
          <span key={col.key} role="columnheader" className={`truncate ${col.wideOnly ? 'md:hidden xl:block' : ''} ${col.align === 'right' ? 'text-right' : ''}`}>
            {col.header}
          </span>
        ))}
        {actions && (
          <span role="columnheader" className="text-right">
            Actions
          </span>
        )}
      </div>

      {sortable ? (
        <SortableList
          items={items}
          getId={getId}
          onReorder={onReorder}
          disabled={reorderDisabled}
          className="divide-y divide-slate-100 dark:divide-slate-800"
          renderItem={renderRow}
        />
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {items.map((item, index) => (
            <div key={getId(item)}>{renderRow(item, index, null)}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DataTable;
