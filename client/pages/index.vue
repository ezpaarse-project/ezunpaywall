<template>
  <div>
    Le serveur ez-unpaywall est une API en graphql qui intérroge une base de
    données ouverte de plus de 26 000 000 d'articles scientifiques disponible en
    open-acess. Ce projet découle d'un besoin pour le projet ezPAARSE, il permet
    entre autre de faire des requêtes par lot de DOI. Cette base de données est
    mise à jour hedbomadairement le mercredi grâce aux fichiers de mise à jour
    fournit par unpaywall.
  </div>
</template>

<script>
export default {
  name: 'Ezpaywall',
  transition: 'slide-x-transition'
}
</script>
