"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var bcryptjs_1 = require("bcryptjs");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var organization, passwordHash, usersData, _i, usersData_1, userData, user, counts;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("🌱 Starting seed...");
                    return [4 /*yield*/, prisma.organization.upsert({
                            where: { slug: "acme-corp" },
                            update: {},
                            create: {
                                name: "Acme Corporation",
                                slug: "acme-corp",
                                description: "A leading technology company",
                            },
                        })];
                case 1:
                    organization = _a.sent();
                    console.log("\u2705 Created organization: ".concat(organization.name));
                    return [4 /*yield*/, (0, bcryptjs_1.hash)("Password123!", 10)];
                case 2:
                    passwordHash = _a.sent();
                    usersData = [
                        // 5 OWNER
                        { name: "Alice Owner", email: "alice.owner@acme.com", role: "OWNER" },
                        { name: "Bob Owner", email: "bob.owner@acme.com", role: "OWNER" },
                        { name: "Charlie Owner", email: "charlie.owner@acme.com", role: "OWNER" },
                        { name: "Diana Owner", email: "diana.owner@acme.com", role: "OWNER" },
                        { name: "Eve Owner", email: "eve.owner@acme.com", role: "OWNER" },
                        // 3 ADMIN
                        { name: "Frank Admin", email: "frank.admin@acme.com", role: "ADMIN" },
                        { name: "Grace Admin", email: "grace.admin@acme.com", role: "ADMIN" },
                        { name: "Henry Admin", email: "henry.admin@acme.com", role: "ADMIN" },
                        // 6 MANAGER
                        { name: "Ivy Manager", email: "ivy.manager@acme.com", role: "MANAGER" },
                        { name: "Jack Manager", email: "jack.manager@acme.com", role: "MANAGER" },
                        { name: "Kate Manager", email: "kate.manager@acme.com", role: "MANAGER" },
                        { name: "Liam Manager", email: "liam.manager@acme.com", role: "MANAGER" },
                        { name: "Mia Manager", email: "mia.manager@acme.com", role: "MANAGER" },
                        { name: "Noah Manager", email: "noah.manager@acme.com", role: "MANAGER" },
                        // 13 MEMBER
                        { name: "Olivia Membre", email: "olivia.membre@acme.com", role: "MEMBER" },
                        { name: "Paul Membre", email: "paul.membre@acme.com", role: "MEMBER" },
                        { name: "Quinn Membre", email: "quinn.membre@acme.com", role: "MEMBER" },
                        { name: "Ruby Membre", email: "ruby.membre@acme.com", role: "MEMBER" },
                        { name: "Sam Membre", email: "sam.membre@acme.com", role: "MEMBER" },
                        { name: "Tina Membre", email: "tina.membre@acme.com", role: "MEMBER" },
                        { name: "Uma Membre", email: "uma.membre@acme.com", role: "MEMBER" },
                        { name: "Victor Membre", email: "victor.membre@acme.com", role: "MEMBER" },
                        { name: "Wendy Membre", email: "wendy.membre@acme.com", role: "MEMBER" },
                        { name: "Xavier Membre", email: "xavier.membre@acme.com", role: "MEMBER" },
                        { name: "Yara Membre", email: "yara.membre@acme.com", role: "MEMBER" },
                        { name: "Zack Membre", email: "zack.membre@acme.com", role: "MEMBER" },
                        { name: "Anna Membre", email: "anna.membre@acme.com", role: "MEMBER" },
                    ];
                    console.log("\n\uD83D\uDCDD Creating ".concat(usersData.length, " users..."));
                    _i = 0, usersData_1 = usersData;
                    _a.label = 3;
                case 3:
                    if (!(_i < usersData_1.length)) return [3 /*break*/, 8];
                    userData = usersData_1[_i];
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: userData.email },
                            update: {},
                            create: {
                                name: userData.name,
                                email: userData.email,
                                emailVerified: true,
                            },
                        })];
                case 4:
                    user = _a.sent();
                    // Create account with password for better-auth
                    return [4 /*yield*/, prisma.account.upsert({
                            where: {
                                providerId_accountId: {
                                    providerId: "credential",
                                    accountId: user.id,
                                },
                            },
                            update: {},
                            create: {
                                accountId: user.id,
                                providerId: "credential",
                                userId: user.id,
                                password: passwordHash,
                            },
                        })];
                case 5:
                    // Create account with password for better-auth
                    _a.sent();
                    // Create membership
                    return [4 /*yield*/, prisma.membership.upsert({
                            where: {
                                userId_organizationId: {
                                    userId: user.id,
                                    organizationId: organization.id,
                                },
                            },
                            update: {},
                            create: {
                                userId: user.id,
                                organizationId: organization.id,
                                role: userData.role,
                            },
                        })];
                case 6:
                    // Create membership
                    _a.sent();
                    console.log("  \u2713 ".concat(userData.name, " (").concat(userData.role, ")"));
                    _a.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 3];
                case 8:
                    console.log("\n📊 Summary:");
                    return [4 /*yield*/, prisma.membership.groupBy({
                            by: ["role"],
                            _count: true,
                            where: {
                                organizationId: organization.id,
                            },
                        })];
                case 9:
                    counts = _a.sent();
                    counts.forEach(function (count) {
                        console.log("  ".concat(count.role, ": ").concat(count._count, " users"));
                    });
                    console.log("\n🎉 Seed completed successfully!");
                    console.log("\n🔐 All users have the password: Password123!");
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error("❌ Error during seed:", e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
