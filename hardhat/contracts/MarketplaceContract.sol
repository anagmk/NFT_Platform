// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Marketplace {

    // This is the "index card" for one item for sale
    struct Listing {
        address seller;   // who's selling it
        uint256 price;    // how much they want (in wei — the smallest unit of ETH)
        bool active;       // is it still available?
    }

    // The address of your NFT contract (set once, when this contract is deployed)
    address public nftContract;

    // The filing cabinet: tokenId → its Listing index card
    mapping(uint256 => Listing) public listings;

    // The public announcements
    event Listed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event Cancelled(uint256 indexed tokenId, address indexed seller);
    event Sold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);

    constructor(address _nftContract) {
        nftContract = _nftContract;
    }

    // JOB 1: List an item for sale
    function listItem(uint256 tokenId, uint256 price) external {
        require(price > 0, "Price must be above zero");
        require(
            IERC721(nftContract).ownerOf(tokenId) == msg.sender,
            "You don't own this NFT"
        );

        // Move the NFT into this contract's safekeeping
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        // Write the index card
        listings[tokenId] = Listing({
            seller: msg.sender,
            price: price,
            active: true
        });

        emit Listed(tokenId, msg.sender, price);
    }

    // JOB 2: Cancel a listing
    function cancelListing(uint256 tokenId) external {
        Listing memory item = listings[tokenId];
        require(item.active, "Not listed");
        require(item.seller == msg.sender, "Not your listing");

        // Give the NFT back
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);

        delete listings[tokenId];

        emit Cancelled(tokenId, msg.sender);
    }

    // JOB 3: Buy an item
    function buyItem(uint256 tokenId) external payable {
        Listing memory item = listings[tokenId];
        require(item.active, "Not listed");
        require(msg.value == item.price, "Wrong payment amount");
        require(msg.sender != item.seller, "Can't buy your own item");

        delete listings[tokenId];

        // Hand over the NFT to the buyer
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);

        // Pay the seller instantly
        payable(item.seller).transfer(msg.value);

        emit Sold(tokenId, item.seller, msg.sender, item.price);
    }
}