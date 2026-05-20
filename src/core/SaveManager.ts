export interface SaveSlotData {
  wins: number;
  losses: number;
  empty: boolean;
}

class SaveManager {
  private readonly storageKey = "box_battle_save_slots";
  private currentSlotIndex: number = -1;

  constructor() {
    this.initializeDefaultStorage();
  }

  private initializeDefaultStorage() {
    if (!localStorage.getItem(this.storageKey)) {
      const defaultSlots: SaveSlotData[] = Array.from({ length: 3 }, () => ({
        wins: 0,
        losses: 0,
        empty: true,
      }));
      localStorage.setItem(this.storageKey, JSON.stringify(defaultSlots));
    }
  }

  public getSlots(): SaveSlotData[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  public getSlot(index: number): SaveSlotData | null {
    const slots = this.getSlots();
    if (index >= 0 && index < slots.length) {
      return slots[index];
    }
    return null;
  }

  public selectSlot(index: number) {
    this.currentSlotIndex = index;
    const slot = this.getSlot(index);
    if (slot && slot.empty) {
      this.writeSlot(index, { wins: 0, losses: 0, empty: false });
    }
  }

  public getCurrentSlotIndex(): number {
    return this.currentSlotIndex;
  }

  public writeSlot(index: number, data: SaveSlotData) {
    const slots = this.getSlots();
    if (index >= 0 && index < slots.length) {
      slots[index] = data;
      localStorage.setItem(this.storageKey, JSON.stringify(slots));
    }
  }

  public eraseSlot(index: number) {
    this.writeSlot(index, { wins: 0, losses: 0, empty: true });
    if (this.currentSlotIndex === index) {
      this.currentSlotIndex = -1;
    }
  }

  public copySlot(fromIndex: number, toIndex: number): boolean {
    const source = this.getSlot(fromIndex);
    if (!source || source.empty) return false;

    this.writeSlot(toIndex, {
      wins: source.wins,
      losses: source.losses,
      empty: false,
    });
    return true;
  }

  public recordWin() {
    if (this.currentSlotIndex === -1) return;
    const slot = this.getSlot(this.currentSlotIndex);
    if (slot) {
      this.writeSlot(this.currentSlotIndex, {
        ...slot,
        wins: slot.wins + 1,
      });
    }
  }

  public recordLoss() {
    if (this.currentSlotIndex === -1) return;
    const slot = this.getSlot(this.currentSlotIndex);
    if (slot) {
      this.writeSlot(this.currentSlotIndex, {
        ...slot,
        losses: slot.losses + 1,
      });
    }
  }
}

export const saveManager = new SaveManager();
