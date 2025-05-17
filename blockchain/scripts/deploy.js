const { ethers } = require("hardhat");

async function main() {
  console.log("Déploiement du contrat CrippleFNIncentive...");

  // Récupérer les comptes disponibles
  const [deployer] = await ethers.getSigners();
  console.log("Déploiement depuis le compte:", deployer.address);

  // Déployer le contrat
  const CrippleFNIncentive = await ethers.getContractFactory("CrippleFNIncentive");
  const incentive = await CrippleFNIncentive.deploy();
  await incentive.deployed();

  console.log("CrippleFNIncentive déployé à l'adresse:", incentive.address);

  // Enregistrer l'adresse du contrat dans un fichier pour référence future
  const fs = require("fs");
  const contractsDir = __dirname + "/../contractAddresses";
  
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/incentive-address.json",
    JSON.stringify({ address: incentive.address }, undefined, 2)
  );

  // Vérifier les informations du contrat déployé
  const minimumStake = await incentive.minimumStake();
  console.log("Mise minimum configurée:", ethers.utils.formatEther(minimumStake), "ETH");

  console.log("Déploiement terminé avec succès!");
}

// Exécuter le script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Erreur lors du déploiement:", error);
    process.exit(1);
  });
