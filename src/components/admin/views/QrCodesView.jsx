import React, { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  Building, Layers, Smartphone, DollarSign, Clock, Download, 
  Printer, Plus, Search, ChevronRight, Eye, Trash2, Edit2, 
  CheckCircle2, RefreshCw, X, Info, QrCode, Copy, Share2, 
  SlidersHorizontal, LayoutGrid, EyeOff, Activity, ShieldAlert
} from 'lucide-react';
import apiService from '../../../services/apiService';

export default function QrCodesView({ 
  restaurantTables = [], 
  adminUser, 
  fetchData, 
  printTableQR 
}) {
  // Top-level Segment: 'tables' (Restaurant) or 'rooms' (Hotel Rooms)
  const [activeSegment, setActiveSegment] = useState('tables');

  // Hotel rooms data states from database
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([
    { name: 'Standard Room' },
    { name: 'Deluxe Room' },
    { name: 'Suite' },
    { name: 'Family Suite' }
  ]);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [floorFilter, setFloorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals & Sliders State
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableForm, setTableForm] = useState({ table_number: '', name: '' });

  const [showFloorModal, setShowFloorModal] = useState(false);
  const [floorForm, setFloorForm] = useState({ name: '' });
  
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomForm, setRoomForm] = useState({ roomNumber: '', floor: '', category: 'Deluxe Room', status: 'Available' });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '' });

  const [selectedIds, setSelectedIds] = useState([]);
  const [editingRoom, setEditingRoom] = useState(null);
  const [editingTable, setEditingTable] = useState(null);
  const [previewItem, setPreviewItem] = useState(null); // Drawer trigger (Table or Room object)
  const [expandedFloors, setExpandedFloors] = useState({}); // Floor expand/collapse mapping

  // Activity logs mock
  const [activities, setActivities] = useState([
    { type: 'generated', msg: 'Room 202 QR Code regenerated', time: '5 Mins Ago' },
    { type: 'scanned', msg: 'Room 102 QR Code scanned by Guest', time: '12 Mins Ago' },
    { type: 'downloaded', msg: 'Table 4 QR PNG downloaded by Admin', time: '1 Hour Ago' },
    { type: 'printed', msg: 'Floor 1 Room QRs printed in bulk', time: '3 Hours Ago' }
  ]);

  // Log activity helper
  const logActivity = (msg, type = 'activity') => {
    setActivities(prev => [{ type, msg, time: 'Just Now' }, ...prev]);
  };

  // Sync hotel configuration from DB
  const loadHotelSetup = async () => {
    try {
      const restId = adminUser?.restaurant_id || 4;
      const [floorRes, roomRes] = await Promise.all([
        apiService.getFloors(restId),
        apiService.getRooms(restId)
      ]);
      if (floorRes.data?.data) {
        setFloors(floorRes.data.data);
        // Pre-fill floor form dropdown
        if (floorRes.data.data.length > 0 && !roomForm.floor) {
          setRoomForm(prev => ({ ...prev, floor: floorRes.data.data[0].name }));
        }
        // Expand all floors by default
        const initExpand = {};
        floorRes.data.data.forEach(f => { initExpand[f.name] = true; });
        setExpandedFloors(initExpand);
      }
      if (roomRes.data?.data) {
        const mappedRooms = roomRes.data.data.map(r => ({
          id: r.id,
          roomNumber: r.room_number,
          floor: r.floor_name || 'Floor 1',
          floorId: r.floor_id,
          category: r.category || 'Standard Room',
          status: r.status || 'Available',
          token: r.secret_token,
          scansCount: 42,
          ordersCount: 8,
          revenueToday: 3800
        }));
        setRooms(mappedRooms);
      }
    } catch (err) {
      console.error("Failed to load hotel configuration", err);
    }
  };

  useEffect(() => {
    loadHotelSetup();
  }, [adminUser]);

  // Statistics memo
  const stats = useMemo(() => {
    const totalTables = restaurantTables.length;
    const totalRooms = rooms.length;
    const activeRooms = rooms.filter(r => r.status === 'Available' || r.status === 'Occupied').length;
    const disabledRooms = totalRooms - activeRooms;
    return { totalTables, totalRooms, activeRooms, disabledRooms };
  }, [restaurantTables, rooms]);

  // Filters Handler
  const filteredRooms = useMemo(() => {
    return rooms.filter(r => {
      const matchSearch = r.roomNumber.includes(searchQuery) || r.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFloor = floorFilter === 'all' || r.floor === floorFilter;
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchFloor && matchStatus;
    });
  }, [rooms, searchQuery, floorFilter, statusFilter]);

  // Table add handlers
  const handleSaveTable = async (e) => {
    e.preventDefault();
    if (!tableForm.table_number) {
      toast.error('Table number is required.');
      return;
    }
    if (editingTable) {
      try {
        await apiService.updateTable(editingTable.id, {
          name: tableForm.name,
          table_number: parseInt(tableForm.table_number),
          secret_token: editingTable.secret_token || editingTable.token
        });
        toast.success("Table updated successfully!");
        logActivity(`Table updated: ${tableForm.name || tableForm.table_number}`, 'edited');
        setShowTableModal(false);
        setEditingTable(null);
        setTableForm({ table_number: '', name: '' });
        fetchData('Table Updated');
      } catch (err) {
        toast.error("Failed to update table");
      }
      return;
    }
    const randomSecret = `T${tableForm.table_number}-DINE${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      const restId = adminUser?.restaurant_id || 4;
      await apiService.createTable({
        table_number: parseInt(tableForm.table_number),
        secret_token: randomSecret,
        restaurant_id: restId,
        name: tableForm.name || `Table ${tableForm.table_number}`
      });
      toast.success("New Restaurant Table added successfully!");
      logActivity(`New Table added: ${tableForm.name || tableForm.table_number}`, 'generated');
      setShowTableModal(false);
      setTableForm({ table_number: '', name: '' });
      fetchData('New Table Added');
    } catch (err) {
      toast.error("Persistence failed");
    }
  };

  // Add Hotel Floor
  const handleSaveFloor = async (e) => {
    e.preventDefault();
    if (!floorForm.name) {
      toast.error('Floor name is required.');
      return;
    }
    try {
      const restId = adminUser?.restaurant_id || 4;
      await apiService.createFloor({
        restaurant_id: restId,
        name: floorForm.name
      });
      toast.success(`${floorForm.name} Added successfully to Database!`);
      logActivity(`Floor registered: ${floorForm.name}`, 'generated');
      setShowFloorModal(false);
      setFloorForm({ name: '' });
      loadHotelSetup();
    } catch (err) {
      toast.error('Failed to save floor');
    }
  };

  // Add Room
  const handleSaveRoom = async (e) => {
    e.preventDefault();
    if (!roomForm.roomNumber) {
      toast.error('Room number is required.');
      return;
    }
    const matchedFloor = floors.find(f => f.name === roomForm.floor);
    if (!matchedFloor) {
      toast.error('Please create floors first.');
      return;
    }
    if (editingRoom) {
      try {
        await apiService.updateRoom(editingRoom.id, {
          floor_id: matchedFloor.id,
          room_number: roomForm.roomNumber,
          category: roomForm.category,
          secret_token: editingRoom.token,
          status: roomForm.status
        });
        toast.success(`Room ${roomForm.roomNumber} updated successfully!`);
        logActivity(`Room updated: Room ${roomForm.roomNumber} (${roomForm.floor})`, 'edited');
        setShowRoomModal(false);
        setEditingRoom(null);
        setRoomForm({ roomNumber: '', floor: floors[0]?.name || 'Floor 1', category: 'Deluxe Room', status: 'Available' });
        loadHotelSetup();
      } catch (err) {
        toast.error('Failed to update room');
      }
      return;
    }
    const roomExists = rooms.some(r => r.roomNumber.toString().trim() === roomForm.roomNumber.toString().trim());
    if (roomExists) {
      toast.error(`Room Number ${roomForm.roomNumber} already exists!`);
      return;
    }
    try {
      const restId = adminUser?.restaurant_id || 4;
      const secret = `R${roomForm.roomNumber}-R${restId}-SECRET-${Math.floor(1000 + Math.random() * 9000)}`;
      await apiService.createRoom({
        restaurant_id: restId,
        floor_id: matchedFloor.id,
        room_number: roomForm.roomNumber,
        category: roomForm.category,
        secret_token: secret,
        status: roomForm.status
      });
      toast.success(`Room ${roomForm.roomNumber} Registered!`);
      logActivity(`Room registered: Room ${roomForm.roomNumber} (${roomForm.floor})`, 'generated');
      setShowRoomModal(false);
      setRoomForm({ roomNumber: '', floor: floors[0]?.name || 'Floor 1', category: 'Deluxe Room', status: 'Available' });
      loadHotelSetup();
    } catch (err) {
      toast.error('Failed to save room');
    }
  };

  // Add Category
  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (!categoryForm.name) {
      toast.error('Category name is required.');
      return;
    }
    setCategories([...categories, { name: categoryForm.name }]);
    toast.success(`Category ${categoryForm.name} Added!`);
    logActivity(`Category added: ${categoryForm.name}`, 'generated');
    setShowCategoryModal(false);
    setCategoryForm({ name: '' });
  };

  // Delete Room
  const handleDeleteRoom = async (id) => {
    const match = rooms.find(r => r.id === id);
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        await apiService.deleteRoom(id);
        toast.success("Room deleted!");
        if (match) {
          logActivity(`Room deleted: Room ${match.roomNumber}`, 'danger');
        }
        loadHotelSetup();
      } catch (err) {
        toast.error("Failed to delete room");
      }
    }
  };

  // Delete Floor
  const handleDeleteFloor = async (id) => {
    const match = floors.find(f => f.id === id);
    if (window.confirm("Are you sure you want to delete this floor?")) {
      try {
        await apiService.deleteFloor(id);
        toast.success("Floor deleted!");
        if (match) {
          logActivity(`Floor deleted: ${match.name}`, 'danger');
        }
        loadHotelSetup();
      } catch (err) {
        toast.error("Failed to delete floor");
      }
    }
  };

  // Delete Table
  const handleDeleteTable = async (id) => {
    const match = restaurantTables.find(t => t.id === id);
    if (window.confirm("Are you sure you want to delete this table?")) {
      try {
        await apiService.deleteTable(id);
        toast.success("Table deleted!");
        if (match) {
          logActivity(`Table deleted: ${match.name || `Table ${match.table_number}`}`, 'danger');
        }
        fetchData('Table Deleted');
      } catch (err) {
        toast.error("Delete failed");
      }
    }
  };

  // Update Status in DB
  const handleUpdateStatus = async (id, newStatus) => {
    const match = rooms.find(r => r.id === id);
    if (!match) return;
    try {
      await apiService.updateRoom(id, {
        floor_id: match.floorId,
        room_number: match.roomNumber,
        category: match.category,
        secret_token: match.token,
        status: newStatus
      });
      toast.success(`Room status updated to ${newStatus}`);
      logActivity(`Room ${match.roomNumber} marked as ${newStatus}`, 'status');
      loadHotelSetup();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // Download QR Code image helper
  const downloadQR = (liveUrl, filename) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(liveUrl)}`;
    fetch(qrUrl)
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `${filename}_QR.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(blobUrl);
        toast.success(`Downloaded ${filename} QR Code!`);
        logActivity(`Downloaded QR PNG: ${filename}`, 'downloaded');
      })
      .catch(() => toast.error("Download failed"));
  };

  // Bulk Actions
  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBulkDownload = () => {
    if (selectedIds.length === 0) {
      toast.error('No items selected.');
      return;
    }
    selectedIds.forEach((id, idx) => {
      setTimeout(() => {
        const tableItem = restaurantTables.find(t => t.id === id);
        if (tableItem) {
          const tokenVal = tableItem.secret_token || tableItem.token;
          const liveUrl = `${window.location.origin}/?s=${tokenVal}`;
          downloadQR(liveUrl, tableItem.name || `Table-${tableItem.table_number}`);
        } else {
          const roomItem = rooms.find(r => r.id === id);
          if (roomItem) {
            const liveUrl = `${window.location.origin}/?s=${roomItem.token}`;
            downloadQR(liveUrl, `Room-${roomItem.roomNumber}`);
          }
        }
      }, idx * 350);
    });
    toast.success(`Started downloading ${selectedIds.length} QR Code keys!`);
    setSelectedIds([]);
  };

  const toggleFloorExpand = (name) => {
    setExpandedFloors(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="enterprise-qr-module animate-slide-up">
      <style>{`
        .enterprise-qr-module {
          background-color: var(--ap-main-bg, var(--bg-deep)) !important;
          color: var(--ap-text-main, var(--text-main)) !important;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
          min-height: 100vh;
          padding: 24px;
        }

        /* Top SaaS Header */
        .sc-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--ap-card-bg, var(--card-bg));
          padding: 20px 24px;
          border-radius: 16px;
          border: 1px solid var(--ap-glass-border, var(--border-default));
          box-shadow: 0 1px 3px rgba(0,0,0,0.01);
          margin-bottom: 24px;
        }

        .sc-title-section h1 {
          font-size: 20px;
          font-weight: 800;
          color: var(--ap-text-main, var(--text-main));
          margin: 0;
        }

        .sc-title-section p {
          font-size: 13px;
          color: var(--ap-text-muted, var(--text-muted));
          margin: 4px 0 0 0;
        }

        /* Stats Cards */
        .sc-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .sc-stat-card {
          background: var(--ap-card-bg, var(--card-bg));
          border: 1px solid var(--ap-glass-border, var(--border-default));
          border-radius: 16px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.01);
        }

        .sc-stat-icon-wrapper {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sc-stat-icon-wrapper.blue { background-color: rgba(37, 99, 235, 0.1); color: #3b82f6; }
        .sc-stat-icon-wrapper.green { background-color: var(--success-bg, rgba(16, 185, 129, 0.1)); color: var(--success, #10b981); }
        .sc-stat-icon-wrapper.gray { background-color: var(--bg-tertiary); color: var(--ap-text-muted, var(--text-muted)); }

        .sc-stat-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--ap-text-muted, var(--text-muted));
          text-transform: uppercase;
        }

        .sc-stat-value {
          font-size: 20px;
          font-weight: 800;
          color: var(--ap-text-main, var(--text-main));
          margin: 2px 0 0 0;
        }

        /* Segment Controller Selector */
        .segment-toolbar {
          display: flex;
          background: var(--bg-tertiary);
          padding: 4px;
          border-radius: 10px;
          margin-bottom: 24px;
          width: fit-content;
        }

        .segment-toggle-btn {
          padding: 8px 16px;
          border: none;
          font-size: 12px;
          font-weight: 700;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--ap-text-muted, var(--text-muted));
          background: transparent;
        }

        .segment-toggle-btn.active {
          background: var(--ap-card-bg, var(--card-bg));
          color: var(--ap-text-main, var(--text-main));
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        /* Filter Toolbar */
        .filter-toolbar {
          background: var(--ap-card-bg, var(--card-bg));
          border: 1px solid var(--ap-glass-border, var(--border-default));
          border-radius: 16px;
          padding: 16px 20px;
          margin-bottom: 24px;
          display: flex;
          flex-wrap: wrap;
          align-items: flex-end;
          gap: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        .filter-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--ap-text-muted, var(--text-muted));
          text-transform: uppercase;
          margin-bottom: 6px;
          display: block;
        }

        .sc-filter-group {
          display: flex !important;
          flex-direction: column !important;
          gap: 6px !important;
          align-items: flex-start !important;
        }

        .filter-select {
          background-color: var(--bg-tertiary);
          border: 1px solid var(--ap-glass-border, var(--border-default));
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 13px;
          font-weight: 600;
          color: var(--ap-text-main, var(--text-main));
          outline: none;
          height: 38px;
          cursor: pointer;
        }

        .sc-search-wrapper {
          position: relative;
          min-width: 240px;
        }

        .sc-search-input {
          width: 100%;
          background: var(--bg-tertiary);
          border: 1px solid var(--ap-glass-border, var(--border-default));
          color: var(--ap-text-main, var(--text-main));
          border-radius: 8px;
          padding: 8px 12px 8px 32px;
          font-size: 13px;
          outline: none;
          height: 38px;
          box-sizing: border-box;
        }

        .sc-search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--ap-text-muted, var(--text-muted));
        }

        /* Grid setups */
        .room-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px;
        }

        .room-card {
          background: var(--ap-card-bg, var(--card-bg));
          border: 1px solid var(--ap-glass-border, var(--border-default));
          border-radius: 16px;
          padding: 18px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.01);
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .room-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        /* Status badges */
        .status-chip {
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 99px;
          text-transform: uppercase;
        }

        .status-chip.available { background: var(--success-bg, rgba(16, 185, 129, 0.1)); color: var(--success, #10b981); }
        .status-chip.occupied { background: rgba(37, 99, 235, 0.1); color: #3b82f6; }
        .status-chip.cleaning { background: var(--warning-bg, rgba(245, 158, 11, 0.1)); color: var(--warning, #f59e0b); }
        .status-chip.maintenance { background: var(--danger-bg, rgba(239, 68, 68, 0.1)); color: var(--danger, #ef4444); }

        /* Buttons */
        .sc-btn-primary {
          background-color: var(--ap-accent-color, var(--accent-color)) !important;
          color: #ffffff !important;
          font-weight: 600 !important;
          border-radius: 8px !important;
          padding: 8px 16px !important;
          border: 1px solid var(--ap-accent-color, var(--accent-color)) !important;
          font-size: 13px !important;
          cursor: pointer !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 6px !important;
          transition: all 0.2s !important;
          height: 36px !important;
        }

        .sc-btn-primary:hover {
          background-color: var(--ap-accent-primary, var(--accent-primary)) !important;
        }

        .sc-btn-outline {
          background-color: transparent !important;
          color: var(--ap-text-main, var(--text-main)) !important;
          font-weight: 600 !important;
          border-radius: 8px !important;
          padding: 8px 16px !important;
          border: 1px solid var(--ap-glass-border, var(--border-default)) !important;
          font-size: 13px !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
          height: 36px !important;
        }

        .sc-btn-outline:hover {
          background-color: var(--bg-tertiary) !important;
        }

        .sc-action-btn-mini {
          background: var(--ap-card-bg, var(--card-bg));
          border: 1px solid var(--ap-glass-border, var(--border-default));
          border-radius: 6px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--ap-text-muted, var(--text-muted));
          transition: all 0.2s;
        }

        .sc-action-btn-mini:hover {
          background: var(--bg-tertiary);
          color: var(--ap-text-main, var(--text-main));
        }

        /* Modals */
        .saas-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.6) !important;
          z-index: 99999 !important;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          backdrop-filter: blur(4px);
        }

        .saas-modal-container {
          background: var(--ap-card-bg, var(--card-bg)) !important;
          border-radius: 16px !important;
          width: 100%;
          max-width: 440px;
          padding: 24px !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1) !important;
          border: 1px solid var(--ap-glass-border, var(--border-default)) !important;
          box-sizing: border-box;
        }

        .form-field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }

        .form-field-group span {
          font-size: 10px;
          font-weight: 700;
          color: var(--ap-text-muted, var(--text-muted));
          text-transform: uppercase;
          text-align: left;
        }

        .form-input-light {
          border: 1px solid var(--ap-glass-border, var(--border-default)) !important;
          border-radius: 8px !important;
          padding: 10px 12px !important;
          font-size: 13px !important;
          color: var(--ap-text-main, var(--text-main)) !important;
          outline: none !important;
          background: var(--bg-tertiary) !important;
          box-sizing: border-box;
          width: 100%;
        }

        /* Slide-over Drawer */
        .saas-drawer-backdrop {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          background: rgba(17, 24, 39, 0.2);
          z-index: 5000;
          display: flex;
          justify-content: flex-end;
          backdrop-filter: blur(1px);
        }

        .saas-drawer-container {
          background: var(--ap-card-bg, var(--card-bg));
          width: 100%;
          max-width: 420px;
          height: 100%;
          padding: 24px;
          box-shadow: -4px 0 20px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          animation: slideOver 0.2s ease-out;
        }

        @keyframes slideOver {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        /* Split Workspace layout */
        .workspace-split {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }

        @media (min-width: 1200px) {
          .workspace-split { grid-template-columns: 72% 28% !important; }
        }

        /* Activity Logs styles */
        .activity-timeline {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .activity-item {
          display: flex;
          gap: 12px;
          font-size: 12px;
        }

        .activity-dot {
          width: 8px;
          height: 8px;
          background: var(--ap-accent-color, var(--accent-color));
          border-radius: 50%;
          margin-top: 4px;
          flex-shrink: 0;
        }

      `}</style>

      {/* --- PAGE HEADER --- */}
      <div className="sc-header-row">
        <div className="sc-title-section">
          <h1>QR Codes Workspace</h1>
          <p>Generate, organize, print and manage Restaurant Table QR Codes and Hotel Room QR Codes.</p>
        </div>
        <div className="flex gap-2">
          {activeSegment === 'tables' && (
            <button onClick={() => setShowTableModal(true)} className="sc-btn-primary flex items-center gap-1">
              <Plus size={14} /> Generate Table
            </button>
          )}
          {activeSegment === 'rooms' && (
            <div className="flex gap-2">
              <button onClick={() => setShowFloorModal(true)} className="sc-btn-outline"><Layers size={14} /> Add Floor</button>
              <button onClick={() => setShowRoomModal(true)} className="sc-btn-primary"><Building size={14} /> Add Room Number</button>
            </div>
          )}
        </div>
      </div>

      {/* --- STATISTICS PANELS --- */}
      <div className="sc-stats-grid">
        <div className="sc-stat-card">
          <div className="sc-stat-icon-wrapper blue">
            <LayoutGrid size={18} />
          </div>
          <div>
            <span className="sc-stat-label">Restaurant QRs</span>
            <h3 className="sc-stat-value">{stats.totalTables}</h3>
          </div>
        </div>
        <div className="sc-stat-card">
          <div className="sc-stat-icon-wrapper blue">
            <Building size={18} />
          </div>
          <div>
            <span className="sc-stat-label">Hotel Room QRs</span>
            <h3 className="sc-stat-value">{stats.totalRooms}</h3>
          </div>
        </div>
        <div className="sc-stat-card">
          <div className="sc-stat-icon-wrapper green">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <span className="sc-stat-label">Active Keys</span>
            <h3 className="sc-stat-value">{stats.activeRooms}</h3>
          </div>
        </div>
        <div className="sc-stat-card">
          <div className="sc-stat-icon-wrapper gray">
            <EyeOff size={18} />
          </div>
          <div>
            <span className="sc-stat-label">Disabled Keys</span>
            <h3 className="sc-stat-value">{stats.disabledRooms}</h3>
          </div>
        </div>
      </div>

      {/* --- SEGMENT SELECTOR CONTROL --- */}
      <div className="segment-toolbar">
        <button 
          onClick={() => setActiveSegment('tables')} 
          className={`segment-toggle-btn ${activeSegment === 'tables' ? 'active' : ''}`}
        >
          🍽️ Restaurant Tables
        </button>
        <button 
          onClick={() => setActiveSegment('rooms')} 
          className={`segment-toggle-btn ${activeSegment === 'rooms' ? 'active' : ''}`}
        >
          🏨 Hotel Rooms Setup
        </button>
      </div>

      {/* --- SPLIT WORKSPACE LAYOUT --- */}
      <div className="workspace-split">

        {/* Left Side: Setup grids */}
        <div>
          {/* ======================================================== */}
          {/* TAB 1: RESTAURANT TABLE QR CARDS                         */}
          {/* ======================================================== */}
          {activeSegment === 'tables' && (
            <div className="room-grid">
              {restaurantTables.map((t, idx) => {
                const tokenVal = t.secret_token || t.token;
                const liveUrl = `${window.location.origin}/?s=${tokenVal}`;
                const isSelected = selectedIds.includes(t.id);
                return (
                  <div key={idx} className="room-card" style={{ border: isSelected ? '2px solid var(--ap-accent-color, var(--accent-color))' : '1px solid var(--ap-glass-border, var(--border-default))' }}>
                    <div>
                      <div className="flex justify-between items-start">
                        <div className="flex gap-2 items-center">
                          <input 
                            type="checkbox" 
                            checked={isSelected} 
                            onChange={() => toggleSelect(t.id)} 
                            className="sc-checkbox" 
                          />
                          <strong className="text-sm" style={{ color: 'var(--ap-text-main, var(--text-main))' }}>{t.name || `Table ${t.table_number}`}</strong>
                        </div>
                        <span className="status-chip available">Active</span>
                      </div>
                      
                      <div 
                        onClick={() => setPreviewItem({ ...t, type: 'Table', liveUrl })}
                        className="w-24 h-24 rounded-xl flex items-center justify-center border my-4 mx-auto cursor-pointer hover:border-blue-500 transition-all"
                        style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--ap-glass-border, var(--border-default))' }}
                        title="Click to Preview Drawer"
                      >
                        <QrCode size={40} style={{ color: 'var(--ap-text-muted, var(--text-muted))' }} />
                      </div>
                      <span className="text-[10px] block text-center font-mono" style={{ color: 'var(--ap-text-muted, var(--text-muted))' }}>Token: {tokenVal}</span>
                    </div>

                    <div className="mt-4 flex gap-1 border-t border-slate-100 pt-3">
                      <button onClick={() => setPreviewItem({ ...t, type: 'Table', liveUrl })} className="sc-action-btn-mini" title="Table details"><Info size={12} /></button>
                      <button 
                        onClick={() => {
                          setEditingTable(t);
                          setTableForm({ table_number: t.table_number.toString(), name: t.name || `Table ${t.table_number}` });
                          setShowTableModal(true);
                        }} 
                        className="sc-action-btn-mini" 
                        title="Edit Name"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button onClick={() => printTableQR(liveUrl, t.name || `Table ${t.table_number}`)} className="sc-action-btn-mini" title="Print QR"><Printer size={12} /></button>
                      <button onClick={() => downloadQR(liveUrl, t.name || `Table-${t.table_number}`)} className="sc-action-btn-mini" title="Download QR"><Download size={12} /></button>
                      <button onClick={() => handleDeleteTable(t.id)} className="sc-action-btn-mini text-red-500 ml-auto" title="Delete"><Trash2 size={12} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: HOTEL ROOMS TREE CARD LAYOUT                      */}
          {/* ======================================================== */}
          {activeSegment === 'rooms' && (
            <>
              <div className="filter-toolbar">
                <div className="sc-filter-group">
                  <span className="filter-label">Search Room</span>
                  <div className="sc-search-wrapper">
                    <Search size={14} className="sc-search-icon" />
                    <input 
                      type="text" 
                      placeholder="e.g. 101" 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)} 
                      className="sc-search-input"
                    />
                  </div>
                </div>

                <div className="sc-filter-group">
                  <span className="filter-label">Floor</span>
                  <select value={floorFilter} onChange={(e) => setFloorFilter(e.target.value)} className="filter-select">
                    <option value="all">All Floors</option>
                    {floors.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                  </select>
                </div>

                <div className="sc-filter-group">
                  <span className="filter-label">Room Status</span>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
                    <option value="all">All States</option>
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>

                {selectedIds.length > 0 && (
                  <button onClick={handleBulkDownload} className="sc-btn-primary flex items-center gap-1 ml-auto" style={{ height: '38px' }}>
                    <Download size={14} /> Bulk Download ({selectedIds.length})
                  </button>
                )}
              </div>

              {/* Grouped Accordions list */}
              {floors.filter(f => floorFilter === 'all' || f.name === floorFilter).map(floor => {
                const floorRooms = filteredRooms.filter(r => r.floor === floor.name);
                const isExpanded = expandedFloors[floor.name] !== false;

                return (
                  <div key={floor.id} className="glass-panel" style={{ padding: '20px', marginBottom: '20px', background: 'var(--ap-card-bg, var(--card-bg))', border: '1px solid var(--ap-glass-border, var(--border-default))', borderRadius: '12px' }}>
                    <div 
                      onClick={() => toggleFloorExpand(floor.name)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--ap-glass-border, var(--border-default))', paddingBottom: '10px', marginBottom: isExpanded ? '16px' : '0', cursor: 'pointer' }}
                    >
                      <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: 'var(--ap-text-main, var(--text-main))', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Layers size={16} className="text-accent" /> {floor.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--ap-text-muted, var(--text-muted))', fontWeight: 600 }}>{floorRooms.length} Rooms</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteFloor(floor.id); }} 
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="room-grid">
                        {floorRooms.map(room => {
                          const isSelected = selectedIds.includes(room.id);
                          const liveRoomUrl = `${window.location.origin}/?s=${room.token}`;
                          return (
                            <div key={room.id} className="room-card" style={{ border: isSelected ? '2px solid var(--ap-accent-color, var(--accent-color))' : '1px solid var(--ap-glass-border, var(--border-default))', background: 'var(--ap-card-bg, var(--card-bg))' }}>
                              <div>
                                <div className="flex justify-between items-start">
                                  <div className="flex gap-2 items-center">
                                    <input 
                                      type="checkbox" 
                                      checked={isSelected} 
                                      onChange={() => toggleSelect(room.id)} 
                                      className="sc-checkbox" 
                                    />
                                    <strong style={{ fontSize: '13px', color: 'var(--ap-text-main, var(--text-main))' }}>Room {room.roomNumber}</strong>
                                  </div>
                                  <span className={`status-chip ${room.status.toLowerCase()}`}>{room.status}</span>
                                </div>
                                
                                <div 
                                  onClick={() => setPreviewItem({ ...room, type: 'Room', liveUrl: liveRoomUrl })}
                                  className="w-20 h-20 rounded-xl flex items-center justify-center border my-3 mx-auto cursor-pointer hover:border-blue-500 transition-all"
                                  style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--ap-glass-border, var(--border-default))' }}
                                  title="Open details"
                                >
                                  <QrCode size={34} style={{ color: 'var(--ap-text-muted, var(--text-muted))' }} />
                                </div>
                                <span style={{ display: 'block', fontSize: '10px', color: 'var(--ap-text-muted, var(--text-muted))', textAlign: 'center' }}>{room.category}</span>
                              </div>

                              <div style={{ marginTop: '16px', display: 'flex', gap: '6px', borderTop: '1px solid var(--ap-glass-border, var(--border-default))', paddingTop: '10px' }}>
                                <button onClick={() => setPreviewItem({ ...room, type: 'Room', liveUrl: liveRoomUrl })} className="sc-action-btn-mini"><Info size={11} /></button>
                                <button onClick={() => printTableQR(liveRoomUrl, `Room ${room.roomNumber}`)} className="sc-action-btn-mini" title="Print"><Printer size={11} /></button>
                                <button 
                                  onClick={() => {
                                    setEditingRoom(room);
                                    setRoomForm({ roomNumber: room.roomNumber, floor: room.floor, category: room.category, status: room.status });
                                    setShowRoomModal(true);
                                  }} 
                                  className="sc-action-btn-mini"
                                >
                                  <Edit2 size={11} />
                                </button>
                                <select 
                                  value={room.status} 
                                  onChange={(e) => handleUpdateStatus(room.id, e.target.value)}
                                  className="saas-select"
                                  style={{ fontSize: '10px', padding: '2px' }}
                                >
                                  <option value="Available">Available</option>
                                  <option value="Occupied">Occupied</option>
                                  <option value="Cleaning">Cleaning</option>
                                  <option value="Maintenance">Maintenance</option>
                                </select>
                                <button onClick={() => downloadQR(liveRoomUrl, `Room-${room.roomNumber}`)} className="sc-action-btn-mini" title="Download"><Download size={11} /></button>
                                <button onClick={() => handleDeleteRoom(room.id)} className="sc-action-btn-mini text-red-500 ml-auto"><Trash2 size={11} /></button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Right Side: Activity timeline */}
        <div className="glass-panel" style={{ padding: '20px', background: 'var(--ap-card-bg, var(--card-bg))', borderRadius: '16px', border: '1px solid var(--ap-glass-border, var(--border-default))', height: 'fit-content' }}>
          <h4 className="flex items-center gap-2 text-sm font-black pb-3 mb-4" style={{ margin: 0, color: 'var(--ap-text-main, var(--text-main))', borderBottom: '1px solid var(--ap-glass-border, var(--border-default))' }}>
            <Activity size={16} className="text-blue-600" /> Operational Log Activity
          </h4>
          <div className="activity-timeline">
            {activities.map((act, i) => (
              <div key={i} className="activity-item">
                <span className="activity-dot" />
                <div>
                  <p style={{ margin: 0, fontWeight: 600, color: 'var(--ap-text-main, var(--text-main))' }}>{act.msg}</p>
                  <span style={{ fontSize: '10px', color: 'var(--ap-text-muted, var(--text-muted))' }}>{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* --- ADD RESTAURANT TABLE MODAL --- */}
      {showTableModal && (
        <div className="saas-modal-backdrop" onClick={() => { setShowTableModal(false); setEditingTable(null); setTableForm({ table_number: '', name: '' }); }}>
          <div className="saas-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="text-sm font-extrabold" style={{ color: 'var(--ap-text-main, var(--text-main))' }}>{editingTable ? "Edit Table Details" : "Add New Table"}</h3>
              <button onClick={() => { setShowTableModal(false); setEditingTable(null); setTableForm({ table_number: '', name: '' }); }} className="sc-action-btn-mini" style={{ border: 'none', background: 'transparent' }}><X size={14} /></button>
            </div>
            <form onSubmit={handleSaveTable}>
              <div className="form-field-group">
                <span>Table Number</span>
                <input 
                  type="text" 
                  value={tableForm.table_number} 
                  onChange={(e) => setTableForm({ ...tableForm, table_number: e.target.value })} 
                  className="form-input-light" 
                  placeholder="e.g. 5" 
                />
              </div>
              <div className="form-field-group">
                <span>Table Label / Description</span>
                <input 
                  type="text" 
                  value={tableForm.name} 
                  onChange={(e) => setTableForm({ ...tableForm, name: e.target.value })} 
                  className="form-input-light" 
                  placeholder="e.g. Balcony VIP" 
                />
              </div>
              <div className="flex justify-end gap-2 mt-4" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setShowTableModal(false); setEditingTable(null); setTableForm({ table_number: '', name: '' }); }} className="sc-btn-outline" style={{ padding: '6px 12px', borderRadius: '6px' }}>Cancel</button>
                <button type="submit" className="sc-btn-primary" style={{ padding: '6px 12px', borderRadius: '6px' }}>{editingTable ? "Save Changes" : "Add Table"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD HOTEL FLOOR MODAL --- */}
      {showFloorModal && (
        <div className="saas-modal-backdrop" onClick={() => setShowFloorModal(false)}>
          <div className="saas-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="text-sm font-extrabold text-slate-800">Add New Hotel Floor</h3>
              <button onClick={() => setShowFloorModal(false)} className="sc-action-btn-mini" style={{ border: 'none', background: 'transparent' }}><X size={14} /></button>
            </div>
            <form onSubmit={handleSaveFloor}>
              <div className="form-field-group">
                <span>Floor Name</span>
                <input 
                  type="text" 
                  value={floorForm.name} 
                  onChange={(e) => setFloorForm({ name: e.target.value })} 
                  className="form-input-light" 
                  placeholder="e.g. Floor 3" 
                />
              </div>
              <div className="flex justify-end gap-2 mt-4" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowFloorModal(false)} className="sc-btn-outline" style={{ padding: '6px 12px', borderRadius: '6px' }}>Cancel</button>
                <button type="submit" className="sc-btn-primary" style={{ padding: '6px 12px', borderRadius: '6px' }}>Save Floor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- REGISTER HOTEL ROOM MODAL --- */}
      {showRoomModal && (
        <div className="saas-modal-backdrop" onClick={() => { setShowRoomModal(false); setEditingRoom(null); setRoomForm({ roomNumber: '', floor: '', category: 'Deluxe Room', status: 'Available' }); }}>
          <div className="saas-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="text-sm font-extrabold text-slate-800">{editingRoom ? "Edit Room Details" : "Register Room Number"}</h3>
              <button onClick={() => { setShowRoomModal(false); setEditingRoom(null); setRoomForm({ roomNumber: '', floor: '', category: 'Deluxe Room', status: 'Available' }); }} className="sc-action-btn-mini" style={{ border: 'none', background: 'transparent' }}><X size={14} /></button>
            </div>
            <form onSubmit={handleSaveRoom}>
              <div className="form-field-group">
                <span>Room Number</span>
                <input 
                  type="text" 
                  value={roomForm.roomNumber} 
                  onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })} 
                  className="form-input-light" 
                  placeholder="e.g. 104" 
                />
              </div>
              <div className="form-field-group">
                <span>Floor Selection</span>
                <select 
                  value={roomForm.floor} 
                  onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                >
                  {floors.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                </select>
              </div>
              <div className="form-field-group">
                <span>Room Category</span>
                <select 
                  value={roomForm.category} 
                  onChange={(e) => setRoomForm({ ...roomForm, category: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                >
                  {categories.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setShowRoomModal(false); setEditingRoom(null); setRoomForm({ roomNumber: '', floor: '', category: 'Deluxe Room', status: 'Available' }); }} className="sc-btn-outline" style={{ padding: '6px 12px', borderRadius: '6px' }}>Cancel</button>
                <button type="submit" className="sc-btn-primary" style={{ padding: '6px 12px', borderRadius: '6px' }}>{editingRoom ? "Save Changes" : "Save Room"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PREVIEW SLIDE-OVER DRAWER --- */}
      {previewItem && (
        <div className="saas-drawer-backdrop" onClick={() => setPreviewItem(null)}>
          <div className="saas-drawer-container" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '20px' }}>
              <strong style={{ fontSize: '15px', color: '#1e293b' }}>QR Key Details</strong>
              <button onClick={() => setPreviewItem(null)} className="sc-action-btn-mini" style={{ border: 'none', background: 'transparent' }}><X size={14} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(previewItem.liveUrl)}`} 
                alt="Live QR Key" 
                style={{ width: '150px', height: '150px', borderRadius: '8px' }}
              />
              <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginTop: '12px', fontWeight: 700 }}>
                {previewItem.type === 'Room' ? `Room ${previewItem.roomNumber}` : previewItem.name || `Table ${previewItem.table_number}`}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', color: '#475569', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Type Class</span>
                <strong style={{ color: '#0f172a' }}>{previewItem.type} QR</strong>
              </div>
              {previewItem.type === 'Room' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Floor Level</span>
                    <strong style={{ color: '#0f172a' }}>{previewItem.floor}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Category Class</span>
                    <strong style={{ color: '#0f172a' }}>{previewItem.category}</strong>
                  </div>
                </>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Scans Registered</span>
                <strong style={{ color: '#0f172a' }}>{previewItem.scansCount || 12} Scans</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Revenue Contributed</span>
                <strong style={{ color: '#0f172a' }}>₹{previewItem.revenueToday || 450}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px', marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(previewItem.liveUrl);
                  toast.success('Key URL copied to clipboard!');
                }}
                className="sc-btn-outline" 
                style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '11px', padding: '0 8px' }}
              >
                <Copy size={12} /> Link
              </button>
              <button 
                onClick={() => {
                  printTableQR(previewItem.liveUrl, previewItem.type === 'Room' ? `Room ${previewItem.roomNumber}` : previewItem.name || `Table ${previewItem.table_number}`);
                  setPreviewItem(null);
                }}
                className="sc-btn-outline" 
                style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '11px', padding: '0 8px' }}
              >
                <Printer size={12} /> Print
              </button>
              <button 
                onClick={() => {
                  downloadQR(previewItem.liveUrl, previewItem.type === 'Room' ? `Room-${previewItem.roomNumber}` : previewItem.name || `Table-${previewItem.table_number}`);
                  setPreviewItem(null);
                }}
                className="sc-btn-primary" 
                style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '11px', padding: '0 8px' }}
              >
                <Download size={12} /> Download
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
