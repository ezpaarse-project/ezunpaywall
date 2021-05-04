<template>
  <div>
    <p>
      Le serveur ezunpaywall est une API en graphql qui intérroge une base de
      données ouverte de plus de 26 000 000 d'articles scientifiques disponible
      en open-acess. Ce projet découle d'un besoin pour le projet ezPAARSE, il
      permet entre autre de faire des requêtes par lot de DOI. Cette base de
      données est mise à jour hedbomadairement le mercredi grâce aux fichiers de
      mise à jour fournit par unpaywall.
    </p>
    <v-card v-if="inUpdate">
      <v-card-title class="justify-center">
        Status
      </v-card-title>
      <v-card-text>
        <InUpdate />
      </v-card-text>
      <v-card-actions @click="show = !show">
        <v-btn color="orange lighten-2" text>
          Details
        </v-btn>
        <v-spacer />
        <v-btn icon>
          <v-icon>{{ show ? "mdi-chevron-up" : "mdi-chevron-down" }}</v-icon>
        </v-btn>
      </v-card-actions>
      <v-expand-transition>
        <div v-show="show">
          <Status :status="status" />
        </div>
      </v-expand-transition>
    </v-card>
    <v-card v-else>
      <v-card-title class="justify-center">
        Status
      </v-card-title>
      <v-card-text>
        <NoInUpdate />
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import InUpdate from '~/components/home/InUpdate.vue'
import NoInUpdate from '~/components/home/NoInUpdate.vue'
import Status from '~/components/home/Status.vue'

export default {
  name: 'Ezpaywall',
  components: {
    InUpdate,
    NoInUpdate,
    Status
  },
  transition: 'slide-x-transition',
  data: () => {
    return {
      show: false,
      inUpdate: false,
      status: {}
    }
  },
  mounted () {
    this.checkIfUpdate()
  },
  methods: {
    async checkIfUpdate () {
      let res
      try {
        res = await ({
          method: 'get',
          url: `${process.env.apiURL}/task`
        })
      } catch (err) {}
      if (res?.data?.inProgress) {
        this.inUpdate = true
        this.status = res.data
      } else {
        this.inUpdate = false
      }
      await new Promise(resolve => setTimeout(resolve, 10000))
      await this.checkIfUpdate()
    }
  }
}
</script>
