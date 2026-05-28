<template>
  <div class="copyright">
    <div class="copyright-left">
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://macnova.cn/app-detail.html?id=eva"
      >
        EVA · Based on Motrix by Dr_rOot · &copy;{{ year }} MCYP
      </a>
    </div>

    <div class="copyright-right">
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://motrix.app/license"
      >
        {{ $t('about.license') }}
      </a>

      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://motrix.app/release"
      >
        {{ $t('about.release') }}
      </a>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'mo-copyright',
    data () {
      const year = new Date().getFullYear()
      return {
        year
      }
    }
  }
</script>

<style lang="scss">
.copyright {
  width: 100%;

  display: flex;
  justify-content: space-between;
  align-items: center;

  font-size: $--font-size-small;

  a {
    color: $--app-copyright-color;
    text-decoration: none;
  }
}

.copyright-left {
  white-space: nowrap;
}

.copyright-right {
  display: flex;
  white-space: nowrap;

  a {
    margin-left: 30px;
  }
}
</style>
