import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    localStorage.removeItem('wedding_wishes');
    localStorage.removeItem('admin_guest_list');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAF8F5] text-center font-sans">
          <div className="max-w-md w-full p-8 rounded-3xl bg-white shadow-xl border border-[#C5A059]/40 space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-xl font-bold">
              ⚠️
            </div>
            <h2 className="font-serif text-xl font-bold text-[#1C2A24]">
              Memuat Ulang Halaman...
            </h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              Terjadi sedikit penyesuaian data baru. Klik tombol di bawah untuk menyegarkan tampilan undangan.
            </p>
            <button
              onClick={this.handleReload}
              className="px-6 py-2.5 rounded-full bg-[#1C2A24] text-white text-xs font-semibold shadow hover:bg-[#2A3F36] transition-all"
            >
              Segarkan Halaman
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
