import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskCard from '../TaskCard';

interface MockTask {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
  user_id: string;
  category: string | null;
  tags: string[] | null;
  due_date: string | null;
  priority: 'low' | 'medium' | 'high' | null;
}

const mockTask: MockTask = {
  id: 1,
  title: 'Test Task',
  description: 'Test Description',
  completed: false,
  created_at: '2024-01-15T10:00:00Z',
  user_id: 'user-1',
  category: 'Desarrollo',
  tags: ['urgent', 'bug'],
  due_date: '2024-01-20T10:00:00Z',
  priority: 'high',
};

const defaultProps = {
  task: mockTask,
  onToggleStatus: vi.fn(),
  onDelete: vi.fn(),
  onEdit: vi.fn(),
};

describe('TaskCard', () => {
  it('should render task title', () => {
    render(<TaskCard {...defaultProps} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('should render task description', () => {
    render(<TaskCard {...defaultProps} />);
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should render category tag', () => {
    render(<TaskCard {...defaultProps} />);
    expect(screen.getByText('Desarrollo')).toBeInTheDocument();
  });

  it('should render tags', () => {
    render(<TaskCard {...defaultProps} />);
    expect(screen.getByText('urgent')).toBeInTheDocument();
    expect(screen.getByText('bug')).toBeInTheDocument();
  });

  it('should render priority', () => {
    render(<TaskCard {...defaultProps} />);
    expect(screen.getByText('high')).toBeInTheDocument();
  });

  it('should show completed state', () => {
    render(<TaskCard {...defaultProps} task={{ ...mockTask, completed: true }} />);
    const title = screen.getByText('Test Task');
    expect(title).toHaveClass('line-through');
  });

  it('should call onToggleStatus when checkbox is clicked', () => {
    render(<TaskCard {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    const toggleButton = buttons[0];
    fireEvent.click(toggleButton);
    expect(defaultProps.onToggleStatus).toHaveBeenCalledWith(1);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(<TaskCard {...defaultProps} />);
    const deleteButton = screen.getByTitle('Eliminar tarea');
    fireEvent.click(deleteButton);
    expect(defaultProps.onDelete).toHaveBeenCalledWith(1);
  });

  it('should call onEdit when edit button is clicked', () => {
    render(<TaskCard {...defaultProps} />);
    const editButton = screen.getByTitle('Editar tarea');
    fireEvent.click(editButton);
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockTask);
  });

  it('should call onShare when share button is clicked', () => {
    const onShare = vi.fn();
    render(<TaskCard {...defaultProps} onShare={onShare} />);
    const shareButton = screen.getByTitle('Compartir tarea');
    fireEvent.click(shareButton);
    expect(onShare).toHaveBeenCalledWith(mockTask);
  });

  it('should not show share button when isShared is true', () => {
    render(<TaskCard {...defaultProps} isShared={true} userPermission="view" />);
    expect(screen.queryByRole('button', { name: /compartir/i })).not.toBeInTheDocument();
  });

  it('should not show delete button when permission is not owner', () => {
    render(<TaskCard {...defaultProps} userPermission="edit" />);
    expect(screen.queryByRole('button', { name: /eliminar/i })).not.toBeInTheDocument();
  });

  it('should show overdue message when task is overdue', () => {
    const overdueTask = {
      ...mockTask,
      due_date: '2020-01-01T10:00:00Z',
      completed: false,
    };
    render(<TaskCard {...defaultProps} task={overdueTask} />);
    expect(screen.getByText(/Vencida/i)).toBeInTheDocument();
  });

  it('should render "Sin descripción" when description is empty', () => {
    render(<TaskCard {...defaultProps} task={{ ...mockTask, description: '' }} />);
    expect(screen.getByText('Sin descripción')).toBeInTheDocument();
  });

  it('should not render category when not provided', () => {
    render(<TaskCard {...defaultProps} task={{ ...mockTask, category: null }} />);
    expect(screen.queryByText('Desarrollo')).not.toBeInTheDocument();
  });

  it('should not render priority when not provided', () => {
    render(<TaskCard {...defaultProps} task={{ ...mockTask, priority: null }} />);
    expect(screen.queryByText('high')).not.toBeInTheDocument();
  });

  it('should render share indicator when task is shared', () => {
    render(<TaskCard {...defaultProps} isShared={true} />);
    expect(screen.getByText('Compartida')).toBeInTheDocument();
  });

  it('should match snapshot', () => {
    const { container } = render(<TaskCard {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });
});
