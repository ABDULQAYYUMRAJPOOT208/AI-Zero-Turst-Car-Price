"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Car,
  ChevronDown,
  DollarSign,
  Home,
  LineChart,
  LogOut,
  Menu,
  User,
  Check,
  Settings,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "next-auth/react";
import axios from "axios";
import { encryptData } from "@/utils/encrypt";

export default function Dashboard() {
  const { data: session, status } = useSession();

  const router = useRouter();
  const [tab, setTab] = useState("predict");
  const [isLoading, setIsLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState<null | {
    predictedPrice: number;
  }>(null);

  const carModels = [
    "Thar LX D 4WD MT CONVERTIBLE",
    "Verna 1.6 VTVT SX",
    "Harrier XT PLUS 2.0L KRYOTEC DARK EDITON",
    "City 1.5L I-VTE V CVT",
    "Ecosport TITANIUM 1.5L DIESEL",
    "WR-V 1.2L I-VTEC VX MT",
    "PUNCH CREATIVE 1.2 RTN DUAL TONE",
    "NEXON XMA DIESEL",
    "NEXON CREATIVE PLUS PETROL DT",
    "NEXON SMART PLUS S PETROL",
    "NEXON SMART PETROL",
  ];

  const [formData, setFormData] = useState({
    make: "",
    model: "",
    make_year: "2022",
    reg_year_only: "2021",
    km_driven: "600",
    condition: "",
    fuel_type: "",
    transmission: "",
    ownership: "",
    "engine_capacity(CC)": "700",
    overall_cost: "6000", // Added
    spare_key: "1", // Added
    has_insurance: "0", // Added
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/sign-in");
  }, [status]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPredictionResult(null);

    try {
      // 1. Prepare Data for Sending

      const requestData = {
        make_year: parseInt(formData.make_year),
        km_driven: parseInt(formData.km_driven),
        fuel_type: formData.fuel_type,
        transmission: formData.transmission,
        ownership: formData.ownership,
        engine_capacity_CC: parseInt(formData["engine_capacity(CC)"]) || 0, // Ensure it's a number, default to 0 if empty
        overall_cost: parseInt(formData.overall_cost) || 0, // Ensure it's a number, add to form
        has_insurance: parseInt(formData.has_insurance) || 0, // Add to form
        spare_key: parseInt(formData.spare_key) || 0, // Add to form
        brand: formData.make,
        model: formData.model,
        reg_year_only: parseInt(formData.reg_year_only),
      };
      const publicKey = await fetch("/public_key.pem").then((res) =>
        res.text()
      );

      // 3. Encrypt data
      const encryptedPayload = await encryptData(requestData, publicKey);
      // 4. Send to Flask backend
      const predictionResponse = await axios.post(
        "http://192.168.1.5:5000/api/predict",
        {
          encryptedKey: encryptedPayload.encryptedKey,
          encryptedData: encryptedPayload.encryptedData,
          iv: encryptedPayload.iv,
        },
        {
          headers: {
            Authorization: `Bearer ${session?.user?.token}`,
            "Content-Type": "application/json",
            // Origin: "http://localhost:3000",
          },
        }
      );
      // Access the result
      const responseData = predictionResponse.data;
      if (predictionResponse.status !== 200) {
        alert(`Prediction failed ${predictionResponse.status}`);
        return;
        // throw new Error(`Prediction failed: ${predictionResponse.status}`);
      }

      // if (
      //   responseData &&
      //   responseData.prediction &&
      //   responseData.prediction.length > 0
      // ) {
      const predictedPrice = responseData.prediction[0];
      setPredictionResult({
        predictedPrice: predictedPrice / 150,
      });
      setTab("results");
      // } else {
      //   throw new Error("Invalid prediction format from server.");
      // }
    } catch (error: any) {
      console.error("Error during prediction:", error);
      alert(`Error during prediction ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <Car className="h-6 w-6" />
                <span className="font-bold">CarValueAI</span>
              </Link>
              <div className="grid gap-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-primary"
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <Car className="h-6 w-6" />
          <span className="font-bold">CarValueAI</span>
        </div>
        <div className="flex-1"></div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <User className="h-4 w-4" />
              <span className="hidden md:inline">My Account</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-muted/40 md:block">
          <div className="flex h-full flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 font-semibold"
              >
                <Car className="h-6 w-6" />
                <span>CarValueAI</span>
              </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
              <nav className="grid gap-1 px-2">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
              </nav>
            </div>
            <div className="border-t p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <User className="h-4 w-4" />
                </div>
                <div className="grid gap-0.5">
                  <p className="text-sm font-medium">User Account</p>
                  <p className="text-xs text-muted-foreground">
                    user@example.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Predictions
                </CardTitle>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  +3 from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Accuracy
                </CardTitle>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92%</div>
                <p className="text-xs text-muted-foreground">
                  +2.5% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Market Trend
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Up</div>
                <p className="text-xs text-muted-foreground">
                  +5.2% in the last 30 days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Saved Vehicles
                </CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  +1 from last month
                </p>
              </CardContent>
            </Card>
          </div>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="predict">Predict Car Value</TabsTrigger>
              <TabsTrigger value="results">Prediction Results</TabsTrigger>
            </TabsList>
            <TabsContent value="predict" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Car Value Prediction</CardTitle>
                  <CardDescription>
                    Enter your vehicle details to get an accurate price
                    prediction.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="make">Brand</Label>
                        <Select
                          value={formData.make}
                          onValueChange={(value) =>
                            handleSelectChange("make", value)
                          }
                          required
                        >
                          <SelectTrigger id="make">
                            <SelectValue placeholder="Select brand" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Mahindra">Mahindra</SelectItem>
                            <SelectItem value="Hyundai">Hyundai</SelectItem>
                            <SelectItem value="Tata">Tata</SelectItem>
                            <SelectItem value="Honda">Honda</SelectItem>
                            <SelectItem value="Ford">Ford</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {/* <div className="space-y-2">
                        <Label htmlFor="model">Model</Label>
                        <Input
                          id="model"
                          name="model"
                          placeholder="e.g., Camry, Civic, F-150"
                          required
                          value={formData.model}
                          onChange={handleChange}
                        />
                      </div> */}

                      <div className="space-y-2">
                        <Label htmlFor="model">Car Model</Label>
                        <Select
                          value={formData.model}
                          onValueChange={(value) =>
                            handleSelectChange("model", value)
                          }
                          required
                        >
                          <SelectTrigger id="model">
                            <SelectValue placeholder="Select car model" />
                          </SelectTrigger>
                          <SelectContent>
                            {carModels.map((model) => (
                              <SelectItem key={model} value={model}>
                                {model}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="make_year">Make Year</Label>
                        <Select
                          value={formData.make_year}
                          onValueChange={(value) =>
                            handleSelectChange("make_year", value)
                          }
                          required
                        >
                          <SelectTrigger id="make_year">
                            <SelectValue placeholder="Select Make Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 15 }, (_, i) => 2024 - i).map(
                              (year) => (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg_year_only">Reg Year</Label>
                        <Select
                          value={formData.reg_year_only}
                          onValueChange={(value) =>
                            handleSelectChange("reg_year_only", value)
                          }
                          required
                        >
                          <SelectTrigger id="reg_year_only">
                            <SelectValue placeholder="Select Registration Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 20 }, (_, i) => 2024 - i).map(
                              (year) => (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="km_driven">Km Driven</Label>
                        <Input
                          id="km_driven"
                          name="km_driven"
                          type="number"
                          placeholder="e.g., 45000"
                          required
                          min={450}
                          max={144000}
                          value={formData.km_driven}
                          onChange={handleChange}
                        />
                      </div>
                      {/* <div className="space-y-2">
                        <Label htmlFor="condition">Condition</Label>
                        <Select
                          value={formData.condition}
                          onValueChange={(value) =>
                            handleSelectChange("condition", value)
                          }
                          required
                        >
                          <SelectTrigger id="condition">
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="excellent">Excellent</SelectItem>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="fair">Fair</SelectItem>
                            <SelectItem value="poor">Poor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div> */}
                      <div className="space-y-2">
                        <Label htmlFor="fuel_type">Fuel Type</Label>
                        <Select
                          value={formData.fuel_type}
                          onValueChange={(value) =>
                            handleSelectChange("fuel_type", value)
                          }
                          required
                        >
                          <SelectTrigger id="fuel_type">
                            <SelectValue placeholder="Select fuel type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Petrol">Petrol</SelectItem>
                            <SelectItem value="Diesel">Diesel</SelectItem>
                            <SelectItem value="CNG">CNG</SelectItem>
                            <SelectItem value="Electric">Electric</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transmission">Transmission</Label>
                        <Select
                          value={formData.transmission}
                          onValueChange={(value) =>
                            handleSelectChange("transmission", value)
                          }
                          required
                        >
                          <SelectTrigger id="transmission">
                            <SelectValue placeholder="Select transmission" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Manual">Manual</SelectItem>
                            <SelectItem value="Automatic">Automatic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ownership">Ownership</Label>
                        <Select
                          value={formData.ownership}
                          onValueChange={(value) =>
                            handleSelectChange("ownership", value)
                          }
                          required
                        >
                          <SelectTrigger id="ownership">
                            <SelectValue placeholder="Select ownership" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1st owner">
                              First Owner
                            </SelectItem>
                            <SelectItem value="2nd owner">
                              Second Owner
                            </SelectItem>
                            <SelectItem value="3rd owner">
                              Third Owner
                            </SelectItem>
                            {/* <SelectItem value="fourth">Fourth Owner</SelectItem> */}
                            {/* <SelectItem value="more_than_fourth">More than Fourth Owner</SelectItem> */}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="engine_capacity(CC)">
                          Engine Capacity (CC)
                        </Label>
                        <Input
                          id="engine_capacity(CC)"
                          name="engine_capacity(CC)"
                          type="number"
                          placeholder="e.g., 1600"
                          required
                          min={600}
                          max={2700}
                          value={formData["engine_capacity(CC)"]}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="overall_cost">Overall Cost</Label>
                        <Input
                          id="overall_cost"
                          name="overall_cost"
                          type="number"
                          placeholder="e.g., 25000"
                          required
                          min={4000}
                          max={47400}
                          value={formData.overall_cost}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="spare_key">Spare Key</Label>
                        <Select
                          value={formData.spare_key}
                          onValueChange={(value) =>
                            handleSelectChange("spare_key", value)
                          }
                          required
                        >
                          <SelectTrigger id="spare_key">
                            <SelectValue placeholder="Has Spare Key" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Yes</SelectItem>
                            <SelectItem value="0">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="has_insurance">has_insurance</Label>
                        <Select
                          value={formData.has_insurance}
                          onValueChange={(value) =>
                            handleSelectChange("has_insurance", value)
                          }
                          required
                        >
                          <SelectTrigger id="has_insurance">
                            <SelectValue placeholder="has_insurance" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Yes</SelectItem>
                            <SelectItem value="0">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Calculating..." : "Get Prediction"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            <TabsContent value="results" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Prediction Results</CardTitle>
                  <CardDescription>
                    View your latest car value prediction and market insights.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {predictionResult ? (
                    <div className="space-y-6">
                      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
                        <div className="flex flex-col items-center justify-center space-y-2 text-center">
                          <DollarSign className="h-12 w-12 text-primary" />
                          <h3 className="text-2xl font-bold tracking-tight">
                            Predicted Value
                          </h3>
                          <div className="text-4xl font-bold text-primary">
                            ${predictionResult.predictedPrice.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border p-4">
                        <h4 className="font-semibold">
                          Factors Affecting Value
                        </h4>
                        <ul className="mt-2 space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <span className="mt-0.5 rounded-full bg-primary/10 p-1">
                              <Check className="h-3 w-3 text-primary" />
                            </span>
                            <span>
                              <strong>Year and Mileage:</strong> Your vehicle's
                              age and mileage are within the desirable range for
                              buyers.
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="mt-0.5 rounded-full bg-primary/10 p-1">
                              <Check className="h-3 w-3 text-primary" />
                            </span>
                            <span>
                              <strong>Condition:</strong> The{" "}
                              {formData.condition} condition of your vehicle
                              positively impacts its value.
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="mt-0.5 rounded-full bg-primary/10 p-1">
                              <Check className="h-3 w-3 text-primary" />
                            </span>
                            <span>
                              <strong>Market Demand:</strong> There is currently
                              high demand for {formData.make} {formData.model}{" "}
                              in your region.
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
                      <div className="rounded-full bg-muted p-3">
                        <LineChart className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium">
                        No Predictions Yet
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Enter your vehicle details in the "Predict Car Value"
                        tab to get started.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() =>
                          (
                            document.querySelector(
                              '[value="predict"]'
                            ) as HTMLElement
                          )?.click()
                        }
                      >
                        Go to Prediction Form
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
