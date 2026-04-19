import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import TaskModal from '../TaskModal.vue';

describe('TaskModal', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(TaskModal, {
      props: {
        isOpen: true,
        task: null,
        categories: []
      }
    });
  });

  it('renders correctly when open', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.props('isOpen')).toBe(true);
  });

  it('does not render when closed', async () => {
    await wrapper.setProps({ isOpen: false });
    expect(wrapper.find('.fixed').exists()).toBe(false);
  });

  it('shows title when creating new task', () => {
    const title = wrapper.find('h2');
    expect(title.text()).toContain('Nueva Tarea');
  });

  it('shows title when editing task', async () => {
    await wrapper.setProps({ 
      task: { id: 1, title: 'Test Task', description: 'Test', priority: 'medium' }
    });
    const title = wrapper.find('h2');
    expect(title.text()).toContain('Editar Tarea');
  });
});