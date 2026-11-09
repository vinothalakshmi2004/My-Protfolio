/**
 * SortableList + DragHandle — drag-and-drop reordering built on @dnd-kit.
 *
 *  <SortableList items getId onReorder(newItems) renderItem={(item, index, handle) => ...} />
 *
 * Works with mouse, touch and keyboard:
 *  - MouseSensor: starts after a 4px move (so clicks on buttons still work)
 *  - TouchSensor: press-and-hold 120ms on the handle (page scrolling stays smooth)
 *  - KeyboardSensor: focus the handle, Space to lift, arrows to move, Space to drop
 * Dragging only starts from the <DragHandle> (touch-action: none), never from inputs.
 * `layout="grid"` switches to a 2D strategy (used for the image gallery).
 */
import { forwardRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MdDragIndicator } from 'react-icons/md';

/** Keeps vertical lists from drifting sideways while dragging. */
const lockHorizontal = ({ transform }) => ({ ...transform, x: 0 });

/** Grip button that starts a drag. Spread the `handle` object from renderItem onto it. */
export const DragHandle = forwardRef(function DragHandle({ handle, disabled, className = '', label = 'Drag to reorder' }, ref) {
  return (
    <button
      ref={(node) => {
        handle?.setActivatorNodeRef?.(node);
        if (typeof ref === 'function') ref(node);
      }}
      type="button"
      aria-label={label}
      title={disabled ? 'Clear search/filters to reorder' : label}
      disabled={disabled}
      {...(disabled ? {} : handle?.attributes)}
      {...(disabled ? {} : handle?.listeners)}
      // 44px touch target on phones/tablets, 36px on lg+; touch-none lets the TouchSensor take over
      className={`flex h-11 w-11 shrink-0 touch-none items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-800 dark:hover:text-slate-200 lg:h-9 lg:w-9 ${
        disabled ? '' : 'cursor-grab active:cursor-grabbing'
      } ${className}`}
    >
      <MdDragIndicator className="h-5 w-5" aria-hidden="true" />
    </button>
  );
});

const SortableItem = ({ id, disabled, children, className, as: Component = 'div' }) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
    position: 'relative',
  };
  return (
    <Component ref={setNodeRef} style={style} className={`${className || ''} ${isDragging ? 'opacity-90 shadow-lg ring-2 ring-primary-500/40' : ''}`}>
      {children({ attributes, listeners, setActivatorNodeRef, isDragging })}
    </Component>
  );
};

export const SortableList = ({
  items,
  getId = (item) => item._id,
  onReorder,
  renderItem,
  disabled = false,
  layout = 'list',
  className = '',
  itemClassName = '',
  as = 'div',
  itemAs = 'div',
}) => {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const ids = items.map((item, index) => String(getId(item, index)));
  const Wrapper = as;

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    onReorder(arrayMove(items, from, to), { from, to });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={layout === 'list' ? [lockHorizontal] : undefined}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={layout === 'grid' ? rectSortingStrategy : verticalListSortingStrategy} disabled={disabled}>
        <Wrapper className={className}>
          {items.map((item, index) => (
            <SortableItem key={ids[index]} id={ids[index]} disabled={disabled} className={itemClassName} as={itemAs}>
              {(handle) => renderItem(item, index, handle)}
            </SortableItem>
          ))}
        </Wrapper>
      </SortableContext>
    </DndContext>
  );
};

export default SortableList;
