import React, { useState, useEffect, useMemo } from 'react';
import { FoodItem, CartItemOption } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { VegBadge } from './VegBadge';
import { Plus, Minus, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export interface FoodCustomizationModalProps {
  food: FoodItem | null;
  restaurant: { id: string; name: string; deliveryFee: number } | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FoodCustomizationModal: React.FC<FoodCustomizationModalProps> = ({
  food,
  restaurant,
  isOpen,
  onClose,
}) => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (food) {
      setQuantity(1);
      const initial: Record<string, string[]> = {};
      food.customizations?.forEach((cust) => {
        try {
          const options = JSON.parse(cust.optionsJson);
          const defaultOpt = options.find((o: any) => o.isDefault) || options[0];
          if (cust.type === 'SINGLE' && defaultOpt) {
            initial[cust.id] = [defaultOpt.id];
          } else {
            initial[cust.id] = [];
          }
        } catch (e) {
          initial[cust.id] = [];
        }
      });
      setSelectedOptions(initial);
    }
  }, [food]);

  const parsedCustomizations = useMemo(() => {
    if (!food?.customizations) return [];
    return food.customizations.map((cust) => {
      let options: Array<{ id: string; name: string; price: number; isDefault?: boolean }> = [];
      try {
        options = JSON.parse(cust.optionsJson);
      } catch (e) {
        options = [];
      }
      return { ...cust, parsedOptions: options };
    });
  }, [food]);

  const selectedOptionsFlat = useMemo((): CartItemOption[] => {
    const list: CartItemOption[] = [];
    parsedCustomizations.forEach((cust) => {
      const selectedIds = selectedOptions[cust.id] || [];
      selectedIds.forEach((optId) => {
        const option = cust.parsedOptions.find((o) => o.id === optId);
        if (option) {
          list.push({
            groupId: cust.id,
            groupTitle: cust.title,
            optionId: option.id,
            optionName: option.name,
            price: option.price,
          });
        }
      });
    });
    return list;
  }, [parsedCustomizations, selectedOptions]);

  const unitPrice = useMemo(() => {
    if (!food) return 0;
    const optionsTotal = selectedOptionsFlat.reduce((sum, o) => sum + o.price, 0);
    return food.price + optionsTotal;
  }, [food, selectedOptionsFlat]);

  const totalPrice = unitPrice * quantity;

  if (!food || !restaurant) return null;

  const handleSelectSingle = (groupId: string, optionId: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupId]: [optionId],
    }));
  };

  const handleToggleMultiple = (groupId: string, optionId: string, maxSelection: number) => {
    setSelectedOptions((prev) => {
      const current = prev[groupId] || [];
      if (current.includes(optionId)) {
        return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
      } else {
        if (maxSelection && current.length >= maxSelection) {
          return prev;
        }
        return { ...prev, [groupId]: [...current, optionId] };
      }
    });
  };

  const handleAddToCart = () => {
    addItem(food, restaurant, quantity, selectedOptionsFlat);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex gap-4 items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <VegBadge isVeg={food.isVeg} />
              <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                Customizable
              </span>
            </div>
            <h3 className="text-lg font-bold text-dark-primary leading-snug">{food.name}</h3>
            <p className="text-sm font-semibold text-dark-primary mt-1">₹{food.price}</p>
            <p className="text-xs text-dark-secondary mt-1 line-clamp-2">{food.description}</p>
          </div>
          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 border border-border">
            <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Customization Options */}
        <div className="space-y-5 max-h-[50vh] overflow-y-auto pr-1">
          {parsedCustomizations.map((cust) => {
            const isSingle = cust.type === 'SINGLE';
            const selected = selectedOptions[cust.id] || [];

            return (
              <div key={cust.id} className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-sm font-bold text-dark-primary">{cust.title}</h4>
                  <span className="text-[11px] font-medium text-dark-muted">
                    {isSingle
                      ? cust.isRequired ? 'Select 1 (Required)' : 'Select 1'
                      : `Choose up to ${cust.maxSelection}`}
                  </span>
                </div>

                <div className="space-y-2">
                  {cust.parsedOptions.map((opt) => {
                    const isChecked = selected.includes(opt.id);

                    return (
                      <div
                        key={opt.id}
                        onClick={() =>
                          isSingle
                            ? handleSelectSingle(cust.id, opt.id)
                            : handleToggleMultiple(cust.id, opt.id, cust.maxSelection)
                        }
                        className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-white border-2 border-primary-500 shadow-sm'
                            : 'bg-white/80 border border-border hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-${isSingle ? 'full' : 'md'} border flex items-center justify-center transition-colors ${
                              isChecked
                                ? 'border-primary-500 bg-primary-500 text-white'
                                : 'border-gray-400 bg-white'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="text-xs font-medium text-dark-primary">{opt.name}</span>
                        </div>
                        <span className="text-xs font-semibold text-dark-primary">
                          {opt.price > 0 ? `+₹${opt.price}` : 'Free'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          {/* Quantity stepper */}
          <div className="flex items-center border border-border rounded-xl bg-white shadow-sm overflow-hidden">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="p-2 hover:bg-gray-100 text-dark-secondary transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3.5 text-sm font-bold text-dark-primary">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="p-2 hover:bg-gray-100 text-dark-secondary transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <Button onClick={handleAddToCart} size="md">
            Add to Cart • ₹{totalPrice}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
