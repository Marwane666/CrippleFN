// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title CrippleFNIncentive
 * @dev Contrat pour gérer les incitations communautaires de vérification de faits
 */
contract CrippleFNIncentive {
    address public owner;
    uint256 public nextFactCheckId;
    
    // Structure pour stocker les vérifications de faits
    struct FactCheck {
        uint256 id;
        string contentHash; // Hash du contenu vérifié
        address verifier;   // Adresse du vérificateur
        uint256 timestamp;  // Horodatage de la vérification
        bool result;        // Résultat de la vérification (vrai/faux)
        uint256 stake;      // Montant mis en jeu par le vérificateur
        uint256 rewards;    // Récompenses accumulées
        bool finalized;     // Si la vérification est finalisée
    }
    
    // Événements
    event FactCheckSubmitted(uint256 indexed id, address indexed verifier, string contentHash, bool result);
    event FactCheckDisputed(uint256 indexed id, address indexed disputer);
    event FactCheckFinalized(uint256 indexed id, bool finalResult, uint256 rewards);
    event RewardsClaimed(address indexed claimer, uint256 amount);
    
    // Mapping des vérifications de faits
    mapping(uint256 => FactCheck) public factChecks;
    
    // Mapping des récompenses en attente par utilisateur
    mapping(address => uint256) public pendingRewards;
    
    // Montant minimum de mise pour soumettre une vérification
    uint256 public minimumStake = 0.01 ether;
    
    /**
     * @dev Constructeur du contrat
     */
    constructor() {
        owner = msg.sender;
        nextFactCheckId = 1;
    }
    
    /**
     * @dev Modificateur pour restreindre l'accès au propriétaire
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Seul le proprietaire peut executer cette fonction");
        _;
    }
    
    /**
     * @dev Permet de soumettre une nouvelle vérification de faits
     * @param contentHash Hash du contenu vérifié
     * @param result Résultat de la vérification (vrai/faux)
     */
    function submitFactCheck(string memory contentHash, bool result) external payable {
        require(msg.value >= minimumStake, "La mise est inferieure au minimum requis");
        
        uint256 factCheckId = nextFactCheckId++;
        factChecks[factCheckId] = FactCheck({
            id: factCheckId,
            contentHash: contentHash,
            verifier: msg.sender,
            timestamp: block.timestamp,
            result: result,
            stake: msg.value,
            rewards: 0,
            finalized: false
        });
        
        emit FactCheckSubmitted(factCheckId, msg.sender, contentHash, result);
    }
    
    /**
     * @dev Permet de contester une vérification de faits existante
     * @param factCheckId ID de la vérification à contester
     * @param newResult Nouveau résultat proposé
     */
    function disputeFactCheck(uint256 factCheckId, bool newResult) external payable {
        FactCheck storage factCheck = factChecks[factCheckId];
        require(factCheck.id > 0, "La verification n'existe pas");
        require(!factCheck.finalized, "La verification est deja finalisee");
        require(factCheck.verifier != msg.sender, "Vous ne pouvez pas contester votre propre verification");
        require(msg.value >= factCheck.stake, "La mise est inferieure a la mise initiale");
        
        // L'algorithme de consensus serait implémenté ici
        // Pour cet exemple, on suppose que la contestation est valide si la mise est supérieure
        
        if (msg.value > factCheck.stake) {
            // Le contestataire a raison
            factCheck.result = newResult;
            factCheck.rewards += factCheck.stake; // La mise initiale va dans la récompense
            pendingRewards[msg.sender] += factCheck.stake / 2; // Le contestataire obtient la moitié
            
            // Le reste va dans un fonds communautaire ou autre mécanisme
        } else {
            // Le vérificateur initial a raison
            factCheck.rewards += msg.value; // La mise du contestataire va dans la récompense
            pendingRewards[factCheck.verifier] += msg.value; // Le vérificateur obtient la récompense
        }
        
        emit FactCheckDisputed(factCheckId, msg.sender);
    }
    
    /**
     * @dev Finalise une vérification de faits après un délai
     * @param factCheckId ID de la vérification à finaliser
     */
    function finalizeFactCheck(uint256 factCheckId) external {
        FactCheck storage factCheck = factChecks[factCheckId];
        require(factCheck.id > 0, "La verification n'existe pas");
        require(!factCheck.finalized, "La verification est deja finalisee");
        require(block.timestamp >= factCheck.timestamp + 1 days, "Delai de contestation non ecoule");
        
        factCheck.finalized = true;
        
        // Attribuer les récompenses
        if (factCheck.rewards == 0) {
            // Aucune contestation, le vérificateur récupère sa mise plus une petite récompense
            pendingRewards[factCheck.verifier] += factCheck.stake;
        }
        
        emit FactCheckFinalized(factCheckId, factCheck.result, factCheck.rewards);
    }
    
    /**
     * @dev Permet de réclamer les récompenses en attente
     */
    function claimRewards() external {
        uint256 amount = pendingRewards[msg.sender];
        require(amount > 0, "Aucune recompense en attente");
        
        pendingRewards[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
        
        emit RewardsClaimed(msg.sender, amount);
    }
    
    /**
     * @dev Modifie le montant minimum de mise requis
     * @param newMinimumStake Nouveau montant minimum
     */
    function setMinimumStake(uint256 newMinimumStake) external onlyOwner {
        minimumStake = newMinimumStake;
    }
    
    /**
     * @dev Transfère la propriété du contrat
     * @param newOwner Nouvelle adresse propriétaire
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Nouvelle adresse proprietaire invalide");
        owner = newOwner;
    }
}
