import { render, replace, remove } from '../../../framework/render.js';
import { EventMode } from '../../../const.js';

import EventItemView from '../view/event-item-view.js';
import EventEditItemView from '../view/event-edit-item-view.js';

export default class EventPresenter {
  #data = {};

  #eventsListContainer = null;
  #eventItem = null;
  #eventEditItem = null;

  #rerenderEvent = null;
  #changeEventMode = null;

  #mode = EventMode.DEFAULT;

  constructor({ eventsListContainer, rerenderEvent, changeEventMode }) {
    this.#eventsListContainer = eventsListContainer;
    this.#rerenderEvent = rerenderEvent;
    this.#changeEventMode = changeEventMode;
  }

  init({ destinations, types, event }) {
    this.#data = { destinations, types, event };

    const prevEventItem = this.#eventItem;
    const prevEventEditItem = this.#eventEditItem;

    this.#eventItem = new EventItemView({
      data: this.#data,
      onRollupButtonClick: () => {
        this.#replaceEventItemToEditForm();
      },
      onFavoriteButtonClick: () => {
        this.#rerenderEvent({ ...this.#data.event, isFavorite: !this.#data.event.isFavorite });
      }
    });

    this.#eventEditItem = new EventEditItemView({
      data: this.#data,
      onRollupButtonClick: () => {
        this.#eventEditItem.reset();
        this.#replaceEditFormToEventItem();
      },
      onEditFormSubmit: (updatedEvent) => {
        this.#replaceEditFormToEventItem();
        this.#rerenderEvent(updatedEvent);
      }
    });

    if (prevEventItem === null) {
      render(this.#eventItem, this.#eventsListContainer.element);
      return;
    }

    if (this.#mode === EventMode.DEFAULT) {
      replace(this.#eventItem, prevEventItem);
    }

    if (this.#mode === EventMode.EDITING) {
      replace(this.#eventEditItem, prevEventEditItem);
    }

    remove(prevEventItem);
    remove(prevEventEditItem);
  }

  destroy() {
    remove(this.#eventItem);
    remove(this.#eventEditItem);
  }

  resetView() {
    if (this.#mode !== EventMode.DEFAULT) {
      this.#eventEditItem.reset();
      this.#replaceEditFormToEventItem();
    }
  }

  updateMode(mode) {
    this.#mode = mode;
  }

  #onDocumentEscapeKeydown = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.#eventEditItem.reset();
      this.#replaceEditFormToEventItem();
      document.removeEventListener('keydown', this.#onDocumentEscapeKeydown);
    }
  };

  #replaceEventItemToEditForm() {
    replace(this.#eventEditItem, this.#eventItem);
    this.#changeEventMode(this.#mode, this.#data.event.id);
    document.addEventListener('keydown', this.#onDocumentEscapeKeydown);
  }

  #replaceEditFormToEventItem() {
    replace(this.#eventItem, this.#eventEditItem);
    this.#changeEventMode(this.#mode, this.#data.event.id);
    document.removeEventListener('keydown', this.#onDocumentEscapeKeydown);
  }
}
