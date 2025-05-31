import { onMounted, onBeforeUnmount } from 'vue'

const vScrollAnimate = {
  mounted(el, binding) {
    const { enter = 'animate-fade-in-up', once = true } = binding.value || {}
    let hasAnimated = false
    function onScroll() {
      const rect = el.getBoundingClientRect()
      const inView = rect.top < window.innerHeight - 60 && rect.bottom > 0
      if (inView && (!once || !hasAnimated)) {
        el.classList.add('tw-animate', enter)
        hasAnimated = true
      } else if (!inView && !once) {
        el.classList.remove('tw-animate', enter)
        hasAnimated = false
      }
    }
    window.addEventListener('scroll', onScroll)
    onScroll()
    el._onScrollAnimate = onScroll
  },
  unmounted(el) {
    window.removeEventListener('scroll', el._onScrollAnimate)
    delete el._onScrollAnimate
  },
}

export default vScrollAnimate
