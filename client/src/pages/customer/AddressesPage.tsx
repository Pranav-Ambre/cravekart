import React, { useState, useEffect } from 'react';
import { userService } from '../../services';
import { Address } from '../../types';
import { useToast } from '../../context/ToastContext';
import { MapPin, Plus, Trash2, CheckCircle2, Home, Briefcase } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { EmptyState } from '../../components/common/EmptyState';

export const CustomerAddressesPage: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { success, error } = useToast();

  // Form state
  const [label, setLabel] = useState('Home');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [postalCode, setPostalCode] = useState('560034');
  const [isSaving, setIsSaving] = useState(false);

  const loadAddresses = async () => {
    try {
      const res = await userService.getAddresses();
      if (res.success && res.data) {
        setAddresses(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!street.trim()) return;

    setIsSaving(true);
    try {
      const res = await userService.addAddress({
        label,
        street: street.trim(),
        landmark: landmark.trim() || undefined,
        city,
        state,
        postalCode,
        isDefault: addresses.length === 0,
      });

      if (res.success) {
        success('Address added successfully!');
        setIsModalOpen(false);
        setStreet('');
        setLandmark('');
        loadAddresses();
      }
    } catch (err: any) {
      error(err.message || 'Failed to save address');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this saved address?')) return;
    try {
      const res = await userService.deleteAddress(id);
      if (res.success) {
        success('Address removed.');
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err: any) {
      error(err.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (addr: Address) => {
    try {
      const res = await userService.updateAddress(addr.id, { isDefault: true });
      if (res.success) {
        success('Default address updated.');
        loadAddresses();
      }
    } catch (err: any) {
      error(err.message || 'Failed to update default address');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-dark-primary">Saved Addresses</h2>
          <p className="text-xs text-dark-secondary mt-0.5">
            Manage your delivery locations for fast 1-click checkout.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Address
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-28 bg-gray-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin className="w-8 h-8" />}
          title="No Addresses Saved"
          description="Save your home or office address to make ordering quick and effortless."
          actionLabel="Add New Address"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between ${
                addr.isDefault
                  ? 'border-primary-500 bg-primary-50/20 shadow-sm'
                  : 'border-border bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {addr.label === 'Home' ? (
                      <Home className="w-4 h-4 text-primary-500" />
                    ) : (
                      <Briefcase className="w-4 h-4 text-primary-500" />
                    )}
                    <span className="text-xs font-bold uppercase tracking-wider text-dark-primary">
                      {addr.label}
                    </span>
                  </div>
                  {addr.isDefault && (
                    <span className="text-[10px] font-bold text-primary-700 bg-primary-50 border border-primary-200 px-2 py-0.5 rounded-full">
                      Default
                    </span>
                  )}
                </div>

                <p className="text-xs text-dark-secondary leading-relaxed">
                  {addr.street}
                  {addr.landmark ? `, Near ${addr.landmark}` : ''}
                </p>
                <p className="text-xs text-dark-muted mt-1">
                  {addr.city}, {addr.state} - {addr.postalCode}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                {!addr.isDefault ? (
                  <button
                    onClick={() => handleSetDefault(addr)}
                    className="font-bold text-primary-600 hover:underline"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span className="text-dark-muted font-medium">Default Address</span>
                )}

                <button
                  onClick={() => handleDelete(addr.id)}
                  className="text-dark-muted hover:text-danger p-1 transition-colors"
                  title="Delete address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Delivery Address"
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex gap-2">
            {['Home', 'Work', 'Other'].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLabel(l)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                  label === l
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-white border-border text-dark-secondary'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <Input
            label="Street Address / Building"
            required
            placeholder="Flat 204, Royal Palms, 7th Main"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
          />

          <Input
            label="Landmark (Optional)"
            placeholder="Opposite Sony Center"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
            <Input
              label="Pincode"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSaving}>
              Save Address
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
