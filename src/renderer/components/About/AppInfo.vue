<template>
  <div class="app-info">
    <div class="app-version">
      <div class="app-icon"></div>

      <div class="app-info-details">
        <span>Version {{ version }}</span>

        <div class="copyright">
<!--          <div class="copyright-left">-->
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://macnova.cn/app-detail.html?id=eva"
            >
              EVA · Based on Motrix by Dr_rOot · &copy;{{ year }} MCYP
            </a>
<!--          </div>-->
        </div>

        <!-- 👇 license 移到下一行 -->
        <div class="copyright">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://motrix.app/license"
          >
            {{ $t('about.license') }}
          </a>
        </div>

      </div>
    </div>

    <div class="engine-info" v-if="!!engine">
      <h4>{{ $t('about.engine-version') }} {{ engine.version }}</h4>

      <ul v-if="!isMas()">
        <li
          v-for="(feature, index) in engine.enabledFeatures"
          :key="`feature-${index}`"
        >
          {{ feature }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  import is from 'electron-is'
  import Logo from '@/components/Logo/Logo'

  export default {
    name: 'mo-app-info',

    data () {
      return {
        year: new Date().getFullYear()
      }
    },

    components: {
      [Logo.name]: Logo
    },

    props: {
      version: {
        type: String,
        default: ''
      },
      engine: {
        type: Object,
        default () {
          return {
            version: '',
            enabledFeatures: []
          }
        }
      }
    },

    methods: {
      isMas: is.mas
    }
  }
</script>

<style lang="scss">
.app-info {
  position: relative;
  margin: 8px 0 0 0;

  .app-icon {
    background: transparent url('~@/assets/app-icon.png') center center no-repeat;
    background-size: 100px 100px;
    width: 100px;
    height: 100px;
  }

  .app-version {
    display: flex;
    align-items: center;
  }

  .app-info-details {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    //margin-bottom: 1.3rem;
    margin-left: 1.5rem;
    gap: 12px;
  }

  .app-version span {
    display: inline-block;
    align-self: flex-start;
    //margin-bottom: 1rem;
    font-size: $--font-size-large;
    color: $--app-version-color;
    line-height: 18px;
  }

  .copyright a:hover {
    text-decoration: underline;
  }

  .engine-info {
    margin: 50px 0 0 0;

    h4 {
      font-size: $--font-size-base;
      font-weight: normal;
      color: $--app-engine-title-color;
    }

    ul {
      font-size: 12px;
      color: $--app-engine-info-color;
      list-style: none;
      padding: 0;
      line-height: 20px;
      margin-bottom: 0;

      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 6px 12px;
    }

    li {
      float: none !important;
      width: auto !important;
    }
  }
}

/* responsive */
@media (max-width: 900px) {
  .app-info {
    .engine-info ul {
      grid-template-columns: repeat(3, 1fr);
    }
  }
}

@media (max-width: 600px) {
  .app-info {
    .app-version {
      flex-direction: column;
      align-items: flex-start;
    }

    .app-info-details {
      margin-left: 0;
      margin-bottom: 0.8rem;
    }

    .engine-info ul {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

@media (max-width: 420px) {
  .app-info {
    .engine-info ul {
      grid-template-columns: 1fr;
    }

    .app-icon {
      width: 72px;
      height: 72px;
      background-size: 72px 72px;
    }
  }
}
</style>
