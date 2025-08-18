import { useState, useEffect } from 'react';
import { 
  Plus, 
  FolderKanban, 
  Users, 
  Lock,
  Globe,
  ChevronDown,
  Search,
  Star,
  MoreVertical
} from 'lucide-react';
import { KanbanBoard, BoardService } from '../../services/boardService';
import { useAuth } from '../../contexts/AuthContext';

interface BoardSelectorProps {
  currentBoardId: string | null;
  onBoardSelect: (boardId: string) => void;
  onBoardCreate: (board: KanbanBoard) => void;
}

const BoardSelector: React.FC<BoardSelectorProps> = ({ 
  currentBoardId, 
  onBoardSelect, 
  onBoardCreate 
}) => {
  const { user } = useAuth();
  const [boards, setBoards] = useState<KanbanBoard[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);

  // Create board form state
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [newBoardIsPrivate, setNewBoardIsPrivate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const result = await BoardService.getBoards(user.id);
      if (!result.error && result.data) {
        setBoards(result.data);
      }
    } catch (error) {
      console.error('Error loading boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async () => {
    if (!newBoardName.trim() || !user?.id) return;

    setCreateLoading(true);
    try {
      const newBoard = {
        name: newBoardName.trim(),
        description: newBoardDescription.trim() || undefined,
        owner_id: user.id,
        is_public: !newBoardIsPrivate,
        settings: {
          columns: [
            { id: 'pending', title: 'Por hacer', color: 'bg-blue-500', order: 0 },
            { id: 'in-progress', title: 'En progreso', color: 'bg-yellow-500', wipLimit: 3, order: 1 },
            { id: 'review', title: 'En revisión', color: 'bg-purple-500', wipLimit: 2, order: 2 },
            { id: 'completed', title: 'Completado', color: 'bg-green-500', order: 3 }
          ],
          theme: 'default',
          auto_archive_completed: true
        }
      };

      const result = await BoardService.createBoard(newBoard);
      if (!result.error && result.data) {
        setBoards(prev => [result.data, ...prev]);
        onBoardCreate(result.data);
        onBoardSelect(result.data.id);
        
        // Reset form
        setNewBoardName('');
        setNewBoardDescription('');
        setNewBoardIsPrivate(false);
        setIsCreateModalOpen(false);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error creating board:', error);
    } finally {
      setCreateLoading(false);
    }
  };

  const filteredBoards = boards.filter(board => {
    const matchesSearch = board.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (board.description && board.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // For now, just filter by search until we add favorites functionality
    return matchesSearch;
  });

  const currentBoard = boards.find(board => board.id === currentBoardId);

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-3 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-w-[200px]"
        >
          <FolderKanban className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <div className="flex-1 text-left">
            <div className="font-medium text-gray-900 dark:text-white truncate">
              {currentBoard ? currentBoard.name : 'Seleccionar Board'}
            </div>
            {currentBoard?.description && (
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {currentBoard.description}
              </div>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar boards..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setShowFavorites(!showFavorites)}
                  className={`p-2 rounded-lg transition-colors ${
                    showFavorites 
                      ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <Star className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Crear Nuevo Board</span>
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {loading ? (
                <div className="p-4 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Cargando...</span>
                </div>
              ) : filteredBoards.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'No se encontraron boards' : 'No tienes boards creados'}
                </div>
              ) : (
                filteredBoards.map((board) => (
                  <button
                    key={board.id}
                    onClick={() => {
                      onBoardSelect(board.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      board.id === currentBoardId ? 'bg-purple-50 dark:bg-purple-900/20 border-r-2 border-purple-500' : ''
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {!board.is_public ? (
                        <Lock className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Globe className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {board.name}
                        </span>
                        {/* Favorite functionality can be added later */}
                      </div>
                      {board.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {board.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-1">
                        <Users className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Board colaborativo
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Open board menu
                      }}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-400" />
                    </button>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Board Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Crear Nuevo Board
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Organiza tus tareas en un nuevo tablero Kanban
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del Board *
                </label>
                <input
                  type="text"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="Mi Board de Proyecto"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={newBoardDescription}
                  onChange={(e) => setNewBoardDescription(e.target.value)}
                  placeholder="Descripción opcional del board"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="private-board"
                  checked={newBoardIsPrivate}
                  onChange={(e) => setNewBoardIsPrivate(e.target.checked)}
                  className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="private-board" className="text-sm text-gray-700 dark:text-gray-300">
                  Board privado (solo tú puedes verlo)
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setNewBoardName('');
                  setNewBoardDescription('');
                  setNewBoardIsPrivate(false);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateBoard}
                disabled={!newBoardName.trim() || createLoading}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {createLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Board
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BoardSelector;
